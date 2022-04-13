import SwtichNetworkButton from "../components/SwitchNetworkButton";

function MetamaskErrorPage({ error }) {
    return <main>
        <div>
            <span>{error}</span>
            {error !== "Please Install/Update MetaMask" && <div>
                <SwtichNetworkButton />
            </div>}
        </div>
    </main>;
}

export default MetamaskErrorPage;