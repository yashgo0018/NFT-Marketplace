import ethers from 'ethers';

export function toChecksumAddress(address) {
    try {
        return ethers.utils.getAddress(address);
    } catch (err) {
        return address;
    }
}
