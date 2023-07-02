* vec2 uv = gl_FragCoord.xy / resolution.xy;
标准化屏幕坐标 = 片段的像素坐标 / 屏幕的分辨率
将坐标归一化到 [0,1] 范围。得到的 uv 矢量的 x 和 y 值将介于 0 和 1 之间，表示当前片段在屏幕上的位置