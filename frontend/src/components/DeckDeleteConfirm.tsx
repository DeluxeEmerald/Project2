import { useNavigate } from "react-router-dom";

function DeckDeleteConfirm()
{   
    const navigate = useNavigate();
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex flex-col items-center 
        justify-center font-grover text-black'>
            <p className="text-black mb-4 mt-6">Deck has successfully been removed.</p>
            <button className="mt-5 w-48 h-8 mb-8 rounded-full bg-main hover:bg-white font-grover" 
                    onClick={() => navigate("/decks")}>Go Back</button>
    </div>
    );
}
export default DeckDeleteConfirm;