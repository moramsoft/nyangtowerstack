import Cocoa

func makeTransparent(inputPath: String, outputPath: String, isSad: Bool = false, isCelebrate: Bool = false) {
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
    
    // Create an RGBA bitmap
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
    
    // Copy pixels from bitmap
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
    
    // Flood fill from outer borders
    var visited = [Bool](repeating: false, count: width * height)
    var queue = [(Int, Int)]()
    
    func isBackground(x: Int, y: Int) -> Bool {
        let offset = (y * width + x) * 4
        let r = destData[offset + 0]
        let g = destData[offset + 1]
        let b = destData[offset + 2]
        // White or near-white background
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
        destData[offset + 3] = 0 // Transparent
        
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
    
    // Feather edges (antialiasing)
    for y in 1..<(height - 1) {
        for x in 1..<(width - 1) {
            let offset = (y * width + x) * 4
            if destData[offset + 3] > 0 {
                // Check if any 4-neighbor is transparent
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
    
    // If sad or celebrate, draw cute vector annotations on top using NSGraphicsContext
    if isSad || isCelebrate {
        let finalImage = NSImage(size: NSSize(width: width, height: height))
        finalImage.addRepresentation(rep)
        
        let annotatedImage = NSImage(size: NSSize(width: width, height: height))
        annotatedImage.lockFocus()
        finalImage.draw(at: .zero, from: NSRect(x: 0, y: 0, width: width, height: height), operation: .copy, fraction: 1.0)
        
        if isSad {
            // Draw cartoon anime teardrops streaming from eyes
            let tearColor = NSColor(calibratedRed: 0.3, green: 0.7, blue: 1.0, alpha: 0.85)
            let tearHighlight = NSColor(calibratedRed: 0.8, green: 0.95, blue: 1.0, alpha: 0.95)
            
            // In Cocoa coordinate system, (0,0) is bottom-left
            // White kitten eyes are roughly at y = 600..650, x = 360 & 580 (in 1024x1024)
            func drawTear(cx: CGFloat, topY: CGFloat, streamHeight: CGFloat) {
                tearColor.setFill()
                let path = NSBezierPath()
                path.move(to: NSPoint(x: cx, y: topY))
                path.curve(to: NSPoint(x: cx - 22, y: topY - streamHeight + 20),
                           controlPoint1: NSPoint(x: cx - 10, y: topY - 30),
                           controlPoint2: NSPoint(x: cx - 22, y: topY - streamHeight + 40))
                path.appendArc(withCenter: NSPoint(x: cx, y: topY - streamHeight + 20),
                               radius: 22, startAngle: 180, endAngle: 0, clockwise: true)
                path.curve(to: NSPoint(x: cx, y: topY),
                           controlPoint1: NSPoint(x: cx + 22, y: topY - streamHeight + 40),
                           controlPoint2: NSPoint(x: cx + 10, y: topY - 30))
                path.close()
                path.fill()
                
                // Highlight
                tearHighlight.setFill()
                let hPath = NSBezierPath(ovalIn: NSRect(x: cx - 12, y: topY - streamHeight + 16, width: 10, height: 16))
                hPath.fill()
            }
            
            drawTear(cx: 360, topY: 620, streamHeight: 140)
            drawTear(cx: 570, topY: 620, streamHeight: 150)
            
            // Draw a cute sweat drop on forehead
            drawTear(cx: 270, topY: 760, streamHeight: 70)
        }
        
        if isCelebrate {
            // Draw a glowing golden crown on top of the cat's head
            let crownGold = NSColor(calibratedRed: 1.0, green: 0.84, blue: 0.0, alpha: 1.0)
            let crownDarkGold = NSColor(calibratedRed: 0.85, green: 0.65, blue: 0.0, alpha: 1.0)
            let jewelRuby = NSColor(calibratedRed: 1.0, green: 0.2, blue: 0.3, alpha: 1.0)
            let jewelEmerald = NSColor(calibratedRed: 0.2, green: 0.85, blue: 0.4, alpha: 1.0)
            
            let cx: CGFloat = 512
            let cy: CGFloat = 830
            let w: CGFloat = 170
            let h: CGFloat = 110
            
            crownDarkGold.setStroke()
            crownGold.setFill()
            let crownPath = NSBezierPath()
            crownPath.lineWidth = 6
            crownPath.move(to: NSPoint(x: cx - w/2, y: cy))
            crownPath.line(to: NSPoint(x: cx - w/2 - 15, y: cy + h))
            crownPath.line(to: NSPoint(x: cx - w/4, y: cy + h * 0.4))
            crownPath.line(to: NSPoint(x: cx, y: cy + h * 1.15))
            crownPath.line(to: NSPoint(x: cx + w/4, y: cy + h * 0.4))
            crownPath.line(to: NSPoint(x: cx + w/2 + 15, y: cy + h))
            crownPath.line(to: NSPoint(x: cx + w/2, y: cy))
            crownPath.close()
            crownPath.fill()
            crownPath.stroke()
            
            // Jewels
            jewelRuby.setFill()
            NSBezierPath(ovalIn: NSRect(x: cx - 14, y: cy + 25, width: 28, height: 28)).fill()
            jewelEmerald.setFill()
            NSBezierPath(ovalIn: NSRect(x: cx - w/3 - 10, y: cy + 28, width: 20, height: 20)).fill()
            NSBezierPath(ovalIn: NSRect(x: cx + w/3 - 10, y: cy + 28, width: 20, height: 20)).fill()
            
            // Golden sparkles
            func drawStar(x: CGFloat, y: CGFloat, size: CGFloat) {
                let starPath = NSBezierPath()
                NSColor(calibratedRed: 1.0, green: 0.9, blue: 0.2, alpha: 1.0).setFill()
                starPath.move(to: NSPoint(x: x, y: y + size))
                starPath.curve(to: NSPoint(x: x + size, y: y), controlPoint1: NSPoint(x: x + size*0.1, y: y + size*0.1), controlPoint2: NSPoint(x: x + size*0.1, y: y + size*0.1))
                starPath.curve(to: NSPoint(x: x, y: y - size), controlPoint1: NSPoint(x: x + size*0.1, y: y - size*0.1), controlPoint2: NSPoint(x: x + size*0.1, y: y - size*0.1))
                starPath.curve(to: NSPoint(x: x - size, y: y), controlPoint1: NSPoint(x: x - size*0.1, y: y - size*0.1), controlPoint2: NSPoint(x: x - size*0.1, y: y - size*0.1))
                starPath.curve(to: NSPoint(x: x, y: y + size), controlPoint1: NSPoint(x: x - size*0.1, y: y + size*0.1), controlPoint2: NSPoint(x: x - size*0.1, y: y + size*0.1))
                starPath.fill()
            }
            drawStar(x: cx - 180, y: cy + 80, size: 28)
            drawStar(x: cx + 180, y: cy + 90, size: 32)
            drawStar(x: cx - 140, y: cy - 40, size: 20)
            drawStar(x: cx + 150, y: cy - 30, size: 24)
        }
        
        annotatedImage.unlockFocus()
        
        guard let finalData = annotatedImage.tiffRepresentation,
              let finalRep = NSBitmapImageRep(data: finalData),
              let pngData = finalRep.representation(using: .png, properties: [:]) else {
            print("Failed to save annotated png")
            return
        }
        try? pngData.write(to: URL(fileURLWithPath: outputPath))
        print("Saved annotated image to \(outputPath)")
        return
    }
    
    guard let pngData = rep.representation(using: .png, properties: [:]) else {
        print("Failed to get PNG data")
        return
    }
    
    do {
        try pngData.write(to: URL(fileURLWithPath: outputPath))
        print("Saved transparent image to \(outputPath)")
    } catch {
        print("Write error: \(error)")
    }
}

let brainDir = "/Users/seunghwanson/.gemini/antigravity/brain/029943b3-043a-46f8-bcc2-8b458b62e42c"
let targetDir = "/Users/seunghwanson/Workspaces/apps/game1/stack-tower/game/assets"

// 1. Convert key visual
let task = Process()
task.launchPath = "/usr/bin/sips"
task.arguments = ["-s", "format", "png", "\(brainDir)/keyvisual_cat_1791018105759.jpg", "--out", "\(targetDir)/keyvisual.png"]
task.launch()
task.waitUntilExit()
print("Keyvisual converted.")

// 2. Process smile
makeTransparent(inputPath: "\(brainDir)/chara_smile_cat_1791018143295.jpg", outputPath: "\(targetDir)/chara_smile.png")

// 3. Process excited
makeTransparent(inputPath: "\(brainDir)/chara_excited_cat_1791018170245.jpg", outputPath: "\(targetDir)/chara_excited.png")

// 4. Process happy
makeTransparent(inputPath: "\(brainDir)/chara_happy_cat_1791018192044.jpg", outputPath: "\(targetDir)/chara_happy.png")

// 5. Process clap
makeTransparent(inputPath: "\(brainDir)/chara_clap_cat_1791018225148.jpg", outputPath: "\(targetDir)/chara_clap.png")

// 6. Sad (from smile cat with tears)
makeTransparent(inputPath: "\(brainDir)/chara_smile_cat_1791018143295.jpg", outputPath: "\(targetDir)/chara_sad.png", isSad: true)

// 7. Celebrate (from happy cat with golden crown and stars)
makeTransparent(inputPath: "\(brainDir)/chara_happy_cat_1791018192044.jpg", outputPath: "\(targetDir)/chara_celebrate.png", isCelebrate: true)
