import { useState, useEffect, CSSProperties } from 'react';
import { connect, disconnect, isConnected, getAddress } from './wallet';
import { incrementCounter, getCounter, getExplorerUrl } from './counter';

const styles: Record<string, CSSProperties> = {
    body: {
        margin: 0,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        minHeight: '100vh',
        color: '#fff',
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
    },
    header: {
        textAlign: 'center' as const,
    },
    logo: {
        fontSize: '48px',
        marginBottom: '8px',
    },
    title: {
        fontSize: '32px',
        fontWeight: 700,
        margin: '0 0 8px 0',
        background: 'linear-gradient(90deg, #fc6e51, #e74c3c)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '14px',
        color: '#8892b0',
        margin: 0,
        maxWidth: '400px',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        boxSizing: 'border-box' as const,
        backdropFilter: 'blur(10px)',
    },
    cardTitle: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#8892b0',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        marginBottom: '16px',
    },
    walletAddress: {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#64ffda',
        background: 'rgba(100, 255, 218, 0.1)',
        padding: '12px 16px',
        borderRadius: '8px',
        wordBreak: 'break-all' as const,
    },
    counterDisplay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    counterValue: {
        fontSize: '72px',
        fontWeight: 700,
        color: '#fff',
        lineHeight: 1,
    },
    counterLabel: {
        fontSize: '14px',
        color: '#8892b0',
    },
    button: {
        width: '100%',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: 600,
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    primaryButton: {
        background: 'linear-gradient(90deg, #fc6e51, #e74c3c)',
        color: '#fff',
    },
    secondaryButton: {
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    disconnectButton: {
        background: 'transparent',
        color: '#8892b0',
        fontSize: '14px',
        padding: '8px 16px',
        marginTop: '12px',
    },
    statusCard: {
        background: 'rgba(100, 255, 218, 0.05)',
        border: '1px solid rgba(100, 255, 218, 0.2)',
    },
    txLink: {
        color: '#64ffda',
        textDecoration: 'none',
        wordBreak: 'break-all' as const,
    },
    loadingDots: {
        display: 'inline-block',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    footer: {
        textAlign: 'center' as const,
        fontSize: '12px',
        color: '#5a6a8a',
        marginTop: '24px',
    },
    footerLink: {
        color: '#64ffda',
        textDecoration: 'none',
    },
    notConnectedMessage: {
        color: '#8892b0',
        fontSize: '14px',
        textAlign: 'center' as const,
    },
};

type TxStatus = 'idle' | 'pending' | 'success' | 'cancelled';

function App() {
    const [connected, setConnected] = useState(isConnected());
    const [address, setAddress] = useState<string | null>(getAddress());
    const [counter, setCounter] = useState<number | null>(null);
    const [txStatus, setTxStatus] = useState<TxStatus>('idle');
    const [txId, setTxId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connected) {
            fetchCounter();
        }
    }, [connected]);

    const fetchCounter = async () => {
        try {
            const value = await getCounter();
            setCounter(value);
        } catch (error) {
            console.error('Failed to fetch counter:', error);
        }
    };

    const handleConnect = () => {
        connect(() => {
            setConnected(true);
            setAddress(getAddress());
        });
    };

    const handleDisconnect = () => {
        disconnect();
        setConnected(false);
        setAddress(null);
        setCounter(null);
        setTxStatus('idle');
        setTxId(null);
    };

    const handleIncrement = async () => {
        setLoading(true);
        setTxStatus('pending');

        await incrementCounter(
            (txId) => {
                setTxId(txId);
                setTxStatus('success');
                setLoading(false);
                // Refresh counter after a short delay
                setTimeout(fetchCounter, 3000);
            },
            () => {
                setTxStatus('cancelled');
                setLoading(false);
            }
        );
    };

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                {/* Header */}
                <header style={styles.header}>
                    <div style={styles.logo}>🔢</div>
                    <h1 style={styles.title}>StackCounter</h1>
                    <p style={styles.subtitle}>
                        A minimal dApp demonstrating WalletKit SDK usage on Stacks mainnet
                    </p>
                </header>

                {/* Wallet Card */}
                <div style={styles.card}>
                    <div style={styles.cardTitle}>Wallet Connection</div>
                    {connected && address ? (
                        <>
                            <div style={styles.walletAddress}>{address}</div>
                            <button
                                style={{ ...styles.button, ...styles.disconnectButton }}
                                onClick={handleDisconnect}
                            >
                                Disconnect
                            </button>
                        </>
                    ) : (
                        <button
                            style={{ ...styles.button, ...styles.primaryButton }}
                            onClick={handleConnect}
                        >
                            🔗 Connect Wallet
                        </button>
                    )}
                </div>

                {/* Counter Card */}
                <div style={styles.card}>
                    <div style={styles.cardTitle}>Onchain Counter</div>
                    {connected ? (
                        <>
                            <div style={styles.counterDisplay}>
                                <span style={styles.counterValue}>
                                    {counter !== null ? counter : '—'}
                                </span>
                                <span style={styles.counterLabel}>Current Count</span>
                            </div>
                            <button
                                style={{
                                    ...styles.button,
                                    ...styles.primaryButton,
                                    marginTop: '20px',
                                    opacity: loading ? 0.7 : 1,
                                }}
                                onClick={handleIncrement}
                                disabled={loading}
                            >
                                {loading ? '⏳ Waiting for signature...' : '➕ Increment Counter'}
                            </button>
                        </>
                    ) : (
                        <p style={styles.notConnectedMessage}>
                            Connect your wallet to interact with the counter
                        </p>
                    )}
                </div>

                {/* Transaction Status Card */}
                {txStatus !== 'idle' && (
                    <div style={{ ...styles.card, ...styles.statusCard }}>
                        <div style={styles.cardTitle}>Transaction Status</div>
                        {txStatus === 'pending' && (
                            <p style={{ color: '#ffd700', margin: 0 }}>
                                ⏳ Please sign the transaction in your wallet...
                            </p>
                        )}
                        {txStatus === 'success' && txId && (
                            <>
                                <p style={{ color: '#64ffda', margin: '0 0 12px 0' }}>
                                    ✅ Transaction submitted successfully!
                                </p>
                                <a
                                    href={getExplorerUrl(txId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.txLink}
                                >
                                    View on Explorer →
                                </a>
                            </>
                        )}
                        {txStatus === 'cancelled' && (
                            <p style={{ color: '#ff6b6b', margin: 0 }}>
                                ❌ Transaction was cancelled
                            </p>
                        )}
                    </div>
                )}

                {/* Footer */}
                <footer style={styles.footer}>
                    Contract:{' '}
                    <a
                        href="https://explorer.stacks.co/address/SP7EGRZWRGBDHWDMJAYER4D40JM8XZCEX14M4ATQ.counter-contract-v2?chain=mainnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.footerLink}
                    >
                        counter-contract-v2
                    </a>
                </footer>
            </div>
        </div>
    );
}

export default App;
