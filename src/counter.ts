import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, cvToValue, uintCV } from '@stacks/transactions';
import { userSession } from './wallet';

const CONTRACT_ADDRESS = 'SP7EGRZWRGBDHWDMJAYER4D40JM8XZCEX14M4ATQ';
const CONTRACT_NAME = 'counter-contract-v2';
const network = new StacksMainnet();

export async function incrementCounter(
    onFinish: (txId: string) => void,
    onCancel: () => void
) {
    await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'increment',
        functionArgs: [],
        onFinish: (data) => {
            onFinish(data.txId);
        },
        onCancel: () => {
            onCancel();
        },
        userSession,
    });
}

export async function getCounter(): Promise<number> {
    try {
        const result = await callReadOnlyFunction({
            network,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-count',
            functionArgs: [],
            senderAddress: CONTRACT_ADDRESS,
        });
        return cvToValue(result) as number;
    } catch (error) {
        console.error('Error fetching counter:', error);
        return 0;
    }
}

export function getExplorerUrl(txId: string): string {
    return `https://explorer.stacks.co/txid/${txId}?chain=mainnet`;
}
