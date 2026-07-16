import { useNavigate } from "react-router-dom";
function Packs()
{
    const navigate = useNavigate();

    function toPackOpening() {
        navigate('/openpack');
    }

    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex flex-col items-center justify-center'>
            <h1 style={{ marginTop:"100px" }}>March of the Machine Epilogue Booster Pack</h1>
            <img style={{ maxWidth: '20%' }} src='src/assets/pack.png' alt="March of the Machine Epilogue Booster Pack"></img>
            <button type="button" id="logoutButton" className="buttons" style={{ marginTop:"10px", marginBottom:"150px" }} onClick={()=>toPackOpening()}> Open Pack </button>
    </div>
    );
}
export default Packs;