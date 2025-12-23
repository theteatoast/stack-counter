import { AppConfig, showConnect, UserSession } from '@stacks/connect';

const appConfig = new AppConfig(['store_write']);
export const userSession = new UserSession({ appConfig });

export function connect(onFinish: () => void) {
    showConnect({
        appDetails: {
            name: 'StackCounter',
            icon: 'https://stacks.co/icon.png',
        },
        onFinish: () => {
            onFinish();
        },
        userSession,
    });
}

export function disconnect() {
    userSession.signUserOut();
}

export function isConnected(): boolean {
    return userSession.isUserSignedIn();
}

export function getAddress(): string | null {
    if (!isConnected()) return null;
    const userData = userSession.loadUserData();
    return userData.profile.stxAddress.mainnet;
}
