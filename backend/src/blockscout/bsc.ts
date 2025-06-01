import axios from 'axios';

export async function getAllAddressTransactions(address: string): Promise<any> {
    const url = `https://eth.blockscout.com/api/v2/addresses/${address}/transactions`;
    try {
        const response = await axios.get(url, {
            params: {
                filter: 'to | from'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching address transactions:', error);
        throw error;
    }
}

export async function getTransactionLogs(txHash: string): Promise<any> {
    const url = `https://eth.blockscout.com/api/v2/transactions/${txHash}/logs`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching logs for tx ${txHash}:`, error);
        return null;
    }
}

// Helper 1: Filter only contract call transactions
export function filterContractCalls(transactionsResult: any): any[] {
    if (!transactionsResult || !transactionsResult.items) return [];
    return transactionsResult.items.filter((tx: any) => {
        return (
            (typeof tx.method === 'string' && tx.method !== 'unknown' && tx.method !== null) ||
            (tx.decoded_input && typeof tx.decoded_input.method_call === 'string' && tx.decoded_input.method_call !== null)
        );
    });
}

// Helper 2: Extract all event parameters from logs
export function extractEventParameters(logsResult: any): any[] {
    if (!logsResult || !logsResult.items) return [];
    const params: any[] = [];
    logsResult.items.forEach((log: any) => {
        if (log.decoded && Array.isArray(log.decoded.parameters)) {
            log.decoded.parameters.forEach((param: any) => {
                params.push({
                    event: log.decoded.method_call,
                    name: param.name,
                    value: param.value,
                    type: param.type,
                    indexed: param.indexed
                });
            });
        }
    });
    return params;
}

// Helper 3: Sums up the number of same parameter values that appear
export function last(params: { event: string, name: string, value: any, type: string, indexed: boolean }[]): Record<string, Record<string, number>> {
    const summary: Record<string, Record<string, number>> = {};
    params.forEach(param => {
        if (!summary[param.name]) summary[param.name] = {};
        const val = String(param.value);
        if (!summary[param.name][val]) summary[param.name][val] = 0;
        summary[param.name][val]++;
    });
    return summary;
}

// // Example usage: run this file directly to test
// if (require.main === module) {
//     (async () => {
//         const address = '0x1dbfaCAAB8792FbA1b5993eF09D59E388Bb0F395'; // Replace with any address you want
//         const result = await getAllAddressTransactions(address);
//         console.log('All transactions:', JSON.stringify(result, null, 2));

//         // Extract and print function names and events
//         const txs = result.items;
//         for (const tx of txs) {
//             let functionName = tx.method;
//             if (!functionName && tx.decoded_input && tx.decoded_input.method_call) {
//                 functionName = tx.decoded_input.method_call;
//             }
//             if (!functionName) {
//                 functionName = 'unknown';
//             }
//             console.log(`Tx Hash: ${tx.hash} | Function: ${functionName}`);

//             // Fetch and print only event parameters for this transaction
//             const logs = await getTransactionLogs(tx.hash);
//             if (logs && logs.items && logs.items.length > 0) {
//                 logs.items.forEach((log: any, i: number) => {
//                     if (log.decoded && log.decoded.parameters) {
//                         console.log(`  Event #${i + 1}: ${log.decoded.method_call}`);
//                         log.decoded.parameters.forEach((param: any) => {
//                             console.log(`    - ${param.name}: ${param.value} (type: ${param.type}, indexed: ${param.indexed})`);
//                         });
//                     } else {
//                         console.log(`  Event #${i + 1}: (undecoded)`);
//                     }
//                 });
//             } else {
//                 console.log('  No events found.');
//             }
//         }
//     })().catch(console.error);
// }

// Second example usage: demonstrate chaining the helpers
if (require.main === module) {
    (async () => {
        console.log('\n--- Second Example: Filter contract calls and extract event parameters ---');
        const address = '0x1dbfaCAAB8792FbA1b5993eF09D59E388Bb0F395'; // Replace with any address you want
        const allTxs = await getAllAddressTransactions(address);
        const contractCalls = filterContractCalls(allTxs);
        console.log('Filtered contract call tx hashes:', contractCalls.map(tx => tx.hash));

        const allEventParams: any[] = [];
        for (const tx of contractCalls) {
            console.log(`\nTx Hash: ${tx.hash}`);
            const logs = await getTransactionLogs(tx.hash);
            const params = extractEventParameters(logs);
            allEventParams.push(...params);
            if (params.length > 0) {
                params.forEach(param => {
                    console.log(`  Event: ${param.event} | ${param.name}: ${param.value} (type: ${param.type}, indexed: ${param.indexed})`);
                });
            } else {
                console.log('  No decoded event parameters found.');
            }
        }
        // Print summary of parameter value counts
        const summary = last(allEventParams);
        console.log('\nSummary of parameter value counts:', JSON.stringify(summary, null, 2));
    })().catch(console.error);
}
