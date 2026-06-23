sequenceDiagram
autonumber
actor User
participant RN as React Native App
participant Clerk as Clerk

    %% ─── App Boot ────────────────────────────────────────────────────────────
    rect rgb(230, 240, 255)
        Note over User,Clerk: App Boot
        User->>RN: Launch app
        RN->>Clerk: Restore cached session token
        Clerk-->>RN: Session valid / expired (isLoaded = true)
        alt Session valid
            RN-->>User: Show home screen
        else No session
            RN-->>User: Show sign-in screen
        end
    end

    %% ─── Sign-Up ─────────────────────────────────────────────────────────────
    rect rgb(220, 255, 230)
        Note over User,Clerk: Sign-Up
        User->>RN: Enter email + password
        RN->>Clerk: Create account
        Clerk-->>User: Send 6-digit verification code
        User->>RN: Enter code
        RN->>Clerk: Verify email code
        alt Code valid
            Clerk-->>RN: Session created
            RN-->>User: Show home screen
        else Code invalid
            Clerk-->>RN: Error
            RN-->>User: Show error message
        end
    end

    %% ─── Sign-In ─────────────────────────────────────────────────────────────
    rect rgb(255, 230, 230)
        Note over User,Clerk: Sign-In
        User->>RN: Enter email + password
        RN->>Clerk: Authenticate
        alt Credentials valid
            Clerk-->>RN: Session created
            RN-->>User: Show home screen
        else MFA required
            Clerk-->>User: Send MFA code
            User->>RN: Enter MFA code
            RN->>Clerk: Verify MFA code
            Clerk-->>RN: Session created
            RN-->>User: Show home screen
        else Invalid credentials
            Clerk-->>RN: Error
            RN-->>User: Show error message
        end
    end

    %% ─── Sign-Out ────────────────────────────────────────────────────────────
    rect rgb(255, 240, 200)
        Note over User,Clerk: Sign-Out
        User->>RN: Tap "Sign Out"
        RN->>Clerk: Invalidate session
        Clerk-->>RN: Session cleared
        RN-->>User: Show sign-in screen
    end
