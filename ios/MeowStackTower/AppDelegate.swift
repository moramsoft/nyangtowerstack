import UIKit
import AVFoundation

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        configureAudioSession()

        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = ViewController()
        window.makeKeyAndVisible()
        self.window = window
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        configureAudioSession()
    }

    private func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try session.setActive(true)
        } catch {
            print("[MeowStackTower] Audio session configuration error: \(error)")
        }
    }
}
