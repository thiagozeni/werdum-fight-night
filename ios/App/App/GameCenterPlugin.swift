import Foundation
import Capacitor
import GameKit

@objc(GameCenterPlugin)
public class GameCenterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameCenterPlugin"
    public let jsName = "GameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAuthenticated", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboard", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unlockAchievement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showAchievements", returnType: CAPPluginReturnPromise),
    ]

    // Guarda contra double-resolve: o authenticateHandler pode disparar
    // múltiplas vezes durante o ciclo de vida do app, mas CAPPluginCall só
    // pode ser resolvido uma vez.
    private var signInResolved = false

    @objc public func signIn(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.signInResolved = false
            let player = GKLocalPlayer.local
            player.authenticateHandler = { vc, error in
                if let vc = vc {
                    CAPLog.print("[GameCenter] presenting auth view controller")
                    self.bridge?.viewController?.present(vc, animated: true, completion: nil)
                    return
                }
                if self.signInResolved { return }
                self.signInResolved = true
                if let error = error {
                    CAPLog.print("[GameCenter] signIn error: \(error.localizedDescription)")
                    call.reject(error.localizedDescription)
                    return
                }
                CAPLog.print("[GameCenter] signIn success: authenticated=\(player.isAuthenticated)")
                call.resolve([
                    "authenticated": player.isAuthenticated,
                    "displayName": player.displayName,
                    "alias": player.alias
                ])
            }
        }
    }

    @objc public func isAuthenticated(_ call: CAPPluginCall) {
        call.resolve([
            "authenticated": GKLocalPlayer.local.isAuthenticated,
            "displayName": GKLocalPlayer.local.displayName
        ])
    }

    @objc public func submitScore(_ call: CAPPluginCall) {
        guard let leaderboardId = call.getString("leaderboardId"),
              let score = call.getInt("score") else {
            call.reject("missing leaderboardId or score")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("not authenticated")
            return
        }
        if #available(iOS 14.0, *) {
            GKLeaderboard.submitScore(
                score,
                context: 0,
                player: GKLocalPlayer.local,
                leaderboardIDs: [leaderboardId]
            ) { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve(["success": true])
                }
            }
        } else {
            let s = GKScore(leaderboardIdentifier: leaderboardId)
            s.value = Int64(score)
            GKScore.report([s]) { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve(["success": true])
                }
            }
        }
    }

    @objc public func showLeaderboard(_ call: CAPPluginCall) {
        let leaderboardId = call.getString("leaderboardId") ?? ""
        DispatchQueue.main.async {
            guard GKLocalPlayer.local.isAuthenticated else {
                CAPLog.print("[GameCenter] showLeaderboard rejected: not authenticated")
                call.reject("not authenticated")
                return
            }
            guard let presenter = self.bridge?.viewController else {
                CAPLog.print("[GameCenter] showLeaderboard rejected: no view controller")
                call.reject("no view controller available")
                return
            }
            let vc: GKGameCenterViewController
            if #available(iOS 14.0, *), !leaderboardId.isEmpty {
                vc = GKGameCenterViewController(
                    leaderboardID: leaderboardId,
                    playerScope: .global,
                    timeScope: .allTime
                )
            } else if #available(iOS 14.0, *) {
                vc = GKGameCenterViewController(state: .leaderboards)
            } else {
                vc = GKGameCenterViewController()
                vc.viewState = .leaderboards
                if !leaderboardId.isEmpty {
                    vc.leaderboardIdentifier = leaderboardId
                }
            }
            vc.gameCenterDelegate = GameCenterDismissDelegate.shared
            presenter.present(vc, animated: true, completion: nil)
            call.resolve()
        }
    }

    @objc public func unlockAchievement(_ call: CAPPluginCall) {
        guard let achievementId = call.getString("achievementId") else {
            call.reject("missing achievementId")
            return
        }
        let percent = call.getDouble("percentComplete") ?? 100.0
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("not authenticated")
            return
        }
        let ach = GKAchievement(identifier: achievementId)
        ach.percentComplete = percent
        ach.showsCompletionBanner = true
        GKAchievement.report([ach]) { error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve(["success": true])
            }
        }
    }

    @objc public func showAchievements(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let vc: GKGameCenterViewController
            if #available(iOS 14.0, *) {
                vc = GKGameCenterViewController(state: .achievements)
            } else {
                vc = GKGameCenterViewController()
                vc.viewState = .achievements
            }
            vc.gameCenterDelegate = GameCenterDismissDelegate.shared
            self.bridge?.viewController?.present(vc, animated: true, completion: nil)
            call.resolve()
        }
    }
}

class GameCenterDismissDelegate: NSObject, GKGameCenterControllerDelegate {
    static let shared = GameCenterDismissDelegate()
    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true, completion: nil)
    }
}
