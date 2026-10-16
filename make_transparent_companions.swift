import Cocoa

func makeTransparent(inputPath: String, outputPath: String) {
    guard let image = NSImage(contentsOfFile: inputPath) else {
        print("Failed to load \(inputPath)")
        return
    }
    
    guard let tiffData = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiffData) else {
        print("Failed to get bitmap representation")
        return
    }
    
    let width = bitmap.pixelsWide
    let height = bitmap.pixelsHigh
    
    guard let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: width * 4,
        bitsPerPixel: 32
    ) else {
        print("Failed to create rep")
        return
    }
    
    guard let destData = rep.bitmapData else { return }
    
    for y in 0..<height {
        for x in 0..<width {
            let offset = (y * width + x) * 4
            let color = bitmap.colorAt(x: x, y: y) ?? NSColor.white
            let r = UInt8(max(0, min(255, color.redComponent * 255)))
            let g = UInt8(max(0, min(255, color.greenComponent * 255)))
            let b = UInt8(max(0, min(255, color.blueComponent * 255)))
            destData[offset + 0] = r
            destData[offset + 1] = g
            destData[offset + 2] = b
            destData[offset + 3] = 255
        }
    }
    
    var visited = [Bool](repeating: false, count: width * height)
    var queue = [(Int, Int)]()
    
    func isBackground(x: Int, y: Int) -> Bool {
        let offset = (y * width + x) * 4
        let r = destData[offset + 0]
        let g = destData[offset + 1]
        let b = destData[offset + 2]
        return r >= 238 && g >= 238 && b >= 238
    }
    
    for x in 0..<width {
        if isBackground(x: x, y: 0) { queue.append((x, 0)); visited[0 * width + x] = true }
        if isBackground(x: x, y: height - 1) { queue.append((x, height - 1)); visited[(height - 1) * width + x] = true }
    }
    for y in 0..<height {
        if isBackground(x: 0, y: y) { queue.append((0, y)); visited[y * width + 0] = true }
        if isBackground(x: width - 1, y: y) { queue.append((width - 1, y)); visited[y * width + (width - 1)] = true }
    }
    
    var head = 0
    while head < queue.count {
        let (cx, cy) = queue[head]
        head += 1
        
        let offset = (cy * width + cx) * 4
        destData[offset + 3] = 0
        
        let neighbors = [(cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)]
        for (nx, ny) in neighbors {
            if nx >= 0 && nx < width && ny >= 0 && ny < height {
                let idx = ny * width + nx
                if !visited[idx] && isBackground(x: nx, y: ny) {
                    visited[idx] = true
                    queue.append((nx, ny))
                }
            }
        }
    }
    
    // Antialiasing edges
    for y in 1..<(height - 1) {
        for x in 1..<(width - 1) {
            let offset = (y * width + x) * 4
            if destData[offset + 3] > 0 {
                let n1 = ((y - 1) * width + x) * 4 + 3
                let n2 = ((y + 1) * width + x) * 4 + 3
                let n3 = (y * width + (x - 1)) * 4 + 3
                let n4 = (y * width + (x + 1)) * 4 + 3
                if destData[n1] == 0 || destData[n2] == 0 || destData[n3] == 0 || destData[n4] == 0 {
                    let r = Double(destData[offset + 0])
                    let g = Double(destData[offset + 1])
                    let b = Double(destData[offset + 2])
                    if r > 220 && g > 220 && b > 220 {
                        let avg = (r + g + b) / 3.0
                        let alpha = max(0, min(255, (255.0 - avg) / 35.0 * 255.0))
                        destData[offset + 3] = UInt8(alpha)
                    }
                }
            }
        }
    }
    
    guard let pngData = rep.representation(using: .png, properties: [:]) else {
        print("Failed to get PNG data")
        return
    }
    
    do {
        try pngData.write(to: URL(fileURLWithPath: outputPath))
        print("Successfully written to \(outputPath)")
    } catch {
        print("Error writing: \(error)")
    }
}

let brainDir = "/Users/seunghwanson/.gemini/antigravity/brain/ef916861-6a53-414a-a9cc-d95c350ccc4c"
let gameAssets = "/Users/seunghwanson/Workspaces/apps/stack-tower/game/assets"
let androidAssets = "/Users/seunghwanson/Workspaces/apps/stack-tower/android/app/src/main/assets/www/assets"

let cats = [
    ("miko_smile_1791144711343.jpg", "cat_miko.png"),
    ("nero_smile_1791144802656.jpg", "cat_nero.png"),
    ("simba_smile_1791144836252.jpg", "cat_simba.png"),
    ("luna_smile_1791144888369.jpg", "cat_luna.png"),
    ("meowperor_smile_1791144979328.jpg", "cat_meowperor.png")
]

for (src, dst) in cats {
    let srcPath = "\(brainDir)/\(src)"
    let dstPath1 = "\(gameAssets)/\(dst)"
    let dstPath2 = "\(androidAssets)/\(dst)"
    print("Processing \(src) -> \(dst)...")
    makeTransparent(inputPath: srcPath, outputPath: dstPath1)
    try? FileManager.default.copyItem(atPath: dstPath1, toPath: dstPath2)
    print("Copied to android assets: \(dstPath2)")
}
print("Done processing all companion cats!")
