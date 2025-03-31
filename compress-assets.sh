ffmpeg -i src/assets/bg-alt.mp4 -vcodec libx264 -crf 28 -preset medium -movflags +faststart -vf "scale=-2:720" src/assets/bg-alt.mp4
# Uses H.264 codec (libx264) which has excellent browser support, 
# Sets CRF (Constant Rate Factor) to 28, 
# Preset medium for a good balance between quality and speed, 
# Add faststart flag to flag which helps with web playback,
# Scales the video to a height of 720 pixels while maintaining aspect ratio.
