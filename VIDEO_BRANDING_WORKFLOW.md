# Island Mountain — Video Branding Workflow

A repeatable guide for taking a raw AI-generated clip (e.g. a Gemini/Veo video),
stripping its watermark, and applying Island Mountain branding (corner logo,
title card, fades). Written from the work done **2026-06-28**; this won't be the
last time, so it's documented to be re-run cold.

---

## 1. Tooling

| Tool | Role | Notes |
|------|------|-------|
| **ffmpeg** (Gyan full build, v8.1.2) | All video/audio processing | Installed via `winget install --id Gyan.FFmpeg -e`. |
| **ffprobe** | Inspect streams (size, fps, duration, codecs) | Ships with ffmpeg. |
| Frame extraction + visual inspection | Locate the watermark, verify each step | Crop + upscale a region, look at it, measure in source pixels. |

### Where the binaries live on this machine
winget drops them under the WinGet packages path (PATH isn't refreshed in the
current shell, so call them by full path):

```
C:\Users\17076\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe
...\bin\ffprobe.exe
```

A new terminal session will pick up the `ffmpeg` / `ffprobe` aliases on PATH.

---

## 2. The guiding principle

**Touch only what was asked. Re-encode video only when pixels actually change,
and preserve audio whenever possible.**

- Video that gets a filter applied (delogo, overlay, fade) **must** be
  re-encoded — we use `libx264 -crf 18 -preset slow` (visually lossless).
- Audio is **copied** (`-c:a copy`) unless the edit changes the timeline
  (prepending a splash/title card) or asks for an audio fade. In those cases we
  re-encode to `aac -b:a 256k` but never alter the underlying content.
- Always write to a **new file**. Never overwrite the source.

---

## 3. Step-by-step process

### Step A — Inspect the source

```bash
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,duration,nb_frames,codec_name -of default=noprint_wrappers=1 INPUT.mp4
```

Typical Gemini short: **1280×720, 24 fps, ~10 s, h264 + aac.** Note the fps —
every generated segment (title card, splash) must match it or `concat`/`xfade`
will complain.

### Step B — Locate the Gemini watermark

The Gemini "sparkle" (four-pointed star) sits in a **fixed** position in the
**bottom-right corner**, roughly centered at **x≈1160, y≈600** in a 1280×720
frame. It pulses slightly but does **not** move.

Find/confirm it by extracting a tight, upscaled crop on a **dark** frame (the
white sparkle is invisible over light backgrounds):

```bash
# 150x150 source crop at (1130,540), nearest-neighbour upscaled 4x for measuring
ffmpeg -y -i INPUT.mp4 -vf "select='eq(n\,239)',crop=150:150:1130:540,scale=600:600:flags=neighbor" -vsync 0 corner.png
```

Then read `corner.png` and convert scaled pixels back to source:
`src = offset + scaled/4`. Measured envelope (with margin) across the two clips
today: **x[1126 … 1198], y[564 … 648]**.

### Step C — Remove the watermark (delogo)

`delogo` interpolates the box from its surrounding border pixels — clean on
varied backgrounds (dark doors, green lasers, smoke).

```bash
ffmpeg -y -i INPUT.mp4 \
  -vf "delogo=x=1126:y=564:w=72:h=84" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a copy -movflags +faststart OUTPUT_nowatermark.mp4
```

> Tune the box per clip — the second video's sparkle was slightly larger and had
> a few stray "twinkle" pixels to the right, so the box was widened vs. the first.

**Verify:** re-crop the same corner from the output and confirm the sparkle is
gone with no smear.

### Step D — Add the Island Mountain corner logo (watermark replacement)

Logo asset (transparent PNG, so no white box): `images/logo-nav-new.png`
(755×240). Confirm transparency by overlaying on a solid colour first.

Combine delogo + logo overlay in one pass (bottom-right, height 70 px, 24 px
margin):

```bash
ffmpeg -y -i INPUT.mp4 -i images/logo-nav-new.png \
  -filter_complex "[1:v]scale=-1:70[wm];[0:v]delogo=x=1126:y=564:w=72:h=84[d];[d][wm]overlay=W-w-24:H-h-24:format=auto[vout]" \
  -map "[vout]" -map "0:a" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a copy -movflags +faststart OUTPUT_branded.mp4
```

This is the **base branded clip** everything else builds on.

### Step E — Title card / intro (optional)

A **2-second static title card** (Logo 3, `images/Island Mountain Logo 3.png`,
1536×1024 with tagline) on white, quick fade-in, then the movie — plus a
fade-out to black at the end. Filtergraph (saved to a script file to avoid shell
escaping of commas):

```
color=c=white:s=1280x720:r=24:d=2[wbg];
[1:v]scale=-1:600[lg];
[wbg][lg]overlay=(W-w)/2:(H-h)/2:format=auto[sp0];
[sp0]format=yuv420p,setsar=1,fps=24,settb=AVTB,fade=t=in:st=0:d=0.4[sp];
[0:v]format=yuv420p,setsar=1,fps=24,settb=AVTB,fade=t=out:st=9.405:d=0.6[mv];
[sp][mv]concat=n=2:v=1:a=0[vout];
[0:a]afade=t=out:st=9.405:d=0.6,adelay=2000:all=1[aout]
```

Run it:

```bash
ffmpeg -y -i BRANDED.mp4 -loop 1 -framerate 24 -t 2 -i "images/Island Mountain Logo 3.png" \
  -filter_complex_script fc.txt -map "[vout]" -map "[aout]" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 256k -movflags +faststart OUTPUT_titlecard.mp4
```

Key mechanics:
- **`-loop 1 -framerate 24 -t 2`** turns the still PNG into a 2 s, 24 fps clip.
- **`fade=t=in:st=0:d=0.4`** = quick fade-up from black on the card.
- **`fade=t=out`** on the movie's own timeline. The movie is 10.005 s, so a 0.6 s
  tail fade starts at `st = 10.005 − 0.6 = 9.405` (applied **before** concat, in
  the source's local time).
- **`adelay=2000`** pushes the audio back 2 s so it starts with the movie (the
  card is silent). **`afade=t=out`** matches the visual end fade so audio doesn't
  hard-cut into black.
- **`concat`** demands both segments share pix_fmt / SAR / fps / timebase — hence
  the `format=yuv420p,setsar=1,fps=24,settb=AVTB` normalisation on both legs.

> An animated intro (logo scaling down to a dot) is also possible with
> `scale=...:eval=frame` driven by `t`, but the static card was the keeper.

---

## 4. Verification habit (do this every render)

1. Extract specific frames: `-vf "select='eq(n\,N)',scale=640:360" -vsync 0 frame.png`.
2. For watermark checks, crop + nearest-neighbour upscale the corner.
3. Look at: first frame, a mid frame, transition boundaries, and the last frame.
4. Confirm duration with `ffprobe -show_entries format=duration`.

Frame numbers at 24 fps: `frame = round(seconds × 24)`. A 2 s card = frames 0–47;
the movie then starts at frame 48.

---

## 5. Assets & conventions

- **Corner watermark logo:** `images/logo-nav-new.png` (transparent, wide).
- **Title-card logo:** `images/Island Mountain Logo 3.png` (with tagline).
- **Encode settings:** `libx264 -crf 18 -preset slow -pix_fmt yuv420p`, audio
  `copy` when possible else `aac -b:a 256k`, always `-movflags +faststart`.
- **Output naming:** keep a clear suffix chain, e.g.
  `…_nowatermark` → `…_branded` → `…_titlecard`. Always a new file.

---

## 6. Quick recipe (next time, the short version)

```
1. ffprobe the clip            → confirm 1280x720 / 24fps / duration
2. delogo the bottom-right     → x=1126 y=564 w=72 h=84 (verify, retune if needed)
3. overlay logo-nav-new.png    → bottom-right, h=70, 24px margin   (= branded base)
4. (optional) title card       → 2s Logo 3 on white, 0.4s fade in
5. (optional) tail fade         → 0.6s fade to black, video + audio
6. verify frames + duration, ship a new file
```
