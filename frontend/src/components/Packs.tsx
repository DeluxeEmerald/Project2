import { useNavigate } from "react-router-dom";
import packImage from '../assets/pack.png';

function Packs()
{
    const navigate = useNavigate();

    function toPackOpening() {
        navigate('/openpack');
    }

    
    return(
    <div id="cardUIDiv" className='packs-shell'>
        <div className='packs-layout'>
            <section className='packs-hero'>
                <span className='brand-mark'>Booster Pack</span>
                <h2 className='packs-title'>March of the Machine Epilogue</h2>
                <p className='packs-copy'>Open a curated booster and reveal cards directly into your inventory with a cleaner, more deliberate pack-opening screen.</p>
                <div className='packs-feature-list'>
                    <div className='packs-feature'><span className='packs-feature-dot'></span><span>Results drop straight into your collection.</span></div>
                    <div className='packs-feature'><span className='packs-feature-dot'></span><span>Animated reveal keeps the opening flow focused.</span></div>
                    <div className='packs-feature'><span className='packs-feature-dot'></span><span>Rare and mythic pulls stay visually distinct.</span></div>
                </div>
            </section>

            <aside className='packs-sidebar'>
                <div className='pack-product-card'>
                    <img className='pack-product-image' src={packImage} alt="March of the Machine Epilogue Booster Pack" />
                    <div className='pack-product-name'>Epilogue Booster</div>
                    <div className='pack-product-meta'>A quick five-card reveal with uncommon, rare, and mythic pulls.</div>
                </div>
                <button type="button" className='primary-button' onClick={()=>toPackOpening()}>Open Pack</button>
            </aside>
        </div>
    </div>
    );
}
export default Packs;