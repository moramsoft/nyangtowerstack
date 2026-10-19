import sys
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

def process_cat_cutout(input_path, output_path, bg_threshold=242):
    img = Image.open(input_path).convert('RGB')
    arr = np.array(img, dtype=np.uint8)
    h, w, _ = arr.shape

    # Near white condition
    is_near_white = (arr[:, :, 0] >= bg_threshold) & (arr[:, :, 1] >= bg_threshold) & (arr[:, :, 2] >= bg_threshold)

    visited = np.zeros((h, w), dtype=bool)
    queue = deque()

    # Border seeds
    for x in range(w):
        if is_near_white[0, x] and not visited[0, x]:
            visited[0, x] = True
            queue.append((0, x))
        if is_near_white[h - 1, x] and not visited[h - 1, x]:
            visited[h - 1, x] = True
            queue.append((h - 1, x))
    for y in range(h):
        if is_near_white[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            queue.append((y, 0))
        if is_near_white[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True
            queue.append((y, w - 1))

    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_near_white[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

    # Mask: 0 for background, 255 for foreground
    alpha_arr = np.where(visited, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha_arr, mode='L')
    
    # Slight feathering on the boundary
    alpha_img = alpha_img.filter(ImageFilter.SMOOTH)

    rgba = img.convert('RGBA')
    rgba.putalpha(alpha_img)
    rgba.save(output_path, 'PNG')
    print(f"Saved transparent PNG: {output_path} ({w}x{h})")

if __name__ == '__main__':
    if len(sys.argv) >= 3:
        process_cat_cutout(sys.argv[1], sys.argv[2])
