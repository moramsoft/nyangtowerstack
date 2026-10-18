import UIKit
import WebKit
import os.log

class ViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {
    private var webView: WKWebView!
    private let logger = Logger(subsystem: "com.meow.stacktower", category: "FirebaseBridge")

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 26/255.0, green: 22/255.0, blue: 43/255.0, alpha: 1.0)

        setupWebView()
        loadLocalGame()
    }

    override var prefersStatusBarHidden: Bool {
        return true
    }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return .portrait
    }

    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        let userContentController = WKUserContentController()

        // Register FirebaseBridge for cross-platform analytics & crash logging
        userContentController.add(self, name: "FirebaseBridge")
        configuration.userContentController = userContentController

        // Audio & media settings
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Create WKWebView
        webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 26/255.0, green: 22/255.0, blue: 43/255.0, alpha: 1.0)
        webView.scrollView.backgroundColor = UIColor(red: 26/255.0, green: 22/255.0, blue: 43/255.0, alpha: 1.0)
        webView.scrollView.bounces = false
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.navigationDelegate = self
        webView.uiDelegate = self

        view.addSubview(webView)
    }

    private func loadLocalGame() {
        if let localHtml = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            let wwwDir = localHtml.deletingLastPathComponent()
            webView.loadFileURL(localHtml, allowingReadAccessTo: wwwDir)
        } else if let localHtmlDirect = Bundle.main.url(forResource: "index", withExtension: "html") {
            let wwwDir = localHtmlDirect.deletingLastPathComponent()
            webView.loadFileURL(localHtmlDirect, allowingReadAccessTo: wwwDir)
        } else {
            logger.error("Could not locate www/index.html in bundle, falling back to local server if available")
            if let serverUrl = URL(string: "http://127.0.0.1:8088/index.html") {
                webView.load(URLRequest(url: serverUrl))
            }
        }
    }

    // MARK: - WKScriptMessageHandler
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "FirebaseBridge" else { return }

        if let body = message.body as? [String: Any] {
            let action = body["action"] as? String ?? "unknown"
            switch action {
            case "logEvent":
                let eventName = body["name"] as? String ?? ""
                let params = body["params"] as? [String: Any] ?? [:]
                logger.info("[FirebaseBridge:iOS] Logged event: \(eventName, privacy: .public) params: \(String(describing: params), privacy: .public)")
            case "recordException":
                let errMsg = body["message"] as? String ?? ""
                let stack = body["stack"] as? String ?? ""
                logger.error("[FirebaseBridge:iOS] Recorded exception: \(errMsg, privacy: .public) stack: \(stack, privacy: .public)")
            case "setUserId":
                let userId = body["userId"] as? String ?? ""
                logger.info("[FirebaseBridge:iOS] Set user ID: \(userId, privacy: .public)")
            case "setCustomKey":
                let key = body["key"] as? String ?? ""
                let value = body["value"] as? String ?? ""
                logger.info("[FirebaseBridge:iOS] Set custom key: \(key, privacy: .public) = \(value, privacy: .public)")
            case "log":
                let logMsg = body["message"] as? String ?? ""
                logger.info("[FirebaseBridge:iOS] Log: \(logMsg, privacy: .public)")
            default:
                logger.info("[FirebaseBridge:iOS] Action \(action, privacy: .public): \(String(describing: body), privacy: .public)")
            }
        } else if let str = message.body as? String {
            logger.info("[FirebaseBridge:iOS] Message string: \(str, privacy: .public)")
        }
    }
}
