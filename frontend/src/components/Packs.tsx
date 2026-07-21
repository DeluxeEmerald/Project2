import { useNavigate } from "react-router-dom";
function Packs()
{
    const navigate = useNavigate();

    function toPackOpening() {
        navigate('/openpack');
    }

    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex flex-col items-center justify-center text-black'>
            <h1 className="mt-8 mb-4 text-black text-xl">March of the Machine Epilogue Booster Pack</h1>
            <img style={{ maxWidth: '20%' }} src='src/assets/pack.png' alt="March of the Machine Epilogue Booster Pack"></img>
            <button className='text-white bg-main mt-10 mb-10 rounded-lg hover:bg-wood hover:text-black w-32 border-2 border-black' 
            onClick={()=>toPackOpening()}> Open Pack </button>
    </div>
    );
}
export default Packs;