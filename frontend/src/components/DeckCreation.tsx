import { useNavigate } from 'react-router-dom';

function DeckCreation()
{

    const navigate = useNavigate();

    return (
        <div id="cardUIDiv" className='rounded-3xl w-full flex-col items-center justify-center'>
            <button onClick={() => {navigate(`/decks`)}} className='bg-black w-32 h-16 text-white rounded-2xl m-[10px]'>Go Back</button>
        </div>
    );
}

export default DeckCreation;