import { useLocation, useNavigate } from 'react-router-dom';

function CardDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const card = location.state?.card;

    if (!card) {
        return (
            <div className='flex flex-col items-center gap-4 text-black p-8 font-grover' id="cardUIDiv">
                <p>No card data available. Please go back and select a card.</p>
                <button onClick={() => navigate(-1)} className='bg-main w-32'>Go Back</button>
            </div>
        );
    }

    return (
        <div className='flex justify-center text-black'>
            <div className='rounded-3xl w-full flex flex-row items-center justify-center gap-8 p-6' id="cardUIDiv">
                <img src={card.imageUrl} alt={card.name} className='h-96 rounded-xl' />
                <div className='flex flex-col gap-2'>
                    <h1 className='text-2xl font-bold text-black'>{card.name}</h1>
                    <p>Type: {card.typeLine}</p>
                    <p>Rarity: {card.rarity}</p>
                    <p>Set: {card.setName}</p>
                    <p>Artist: {card.artist}</p>
                </div>
            </div>
        </div>
    );
}

export default CardDetails;