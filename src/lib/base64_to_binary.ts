/*
 Node( >v16) and Browser
*/
export default function base64ToBinary(base64: string): Uint8Array {
    const binary = atob(base64);
    const rc = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        rc[i] = binary.charCodeAt(i);
    }
    return rc;
}
