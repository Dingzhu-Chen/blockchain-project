import Script from "next/script";
import Interface from '../components/Interface.js';

const Index = () => {
    return (
        <div>
            <Script src="/js/snarkjs.min.js" />
            <Interface />
        </div>
    );
};

export default Index;
