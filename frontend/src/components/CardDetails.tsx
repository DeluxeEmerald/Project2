import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { buildPath } from './Path';

function CardDetails() {
    const { cardId } = useParams();
    const [card, setCard] = useState<any>(null);

    useEffect(() => {
        async function fetchCard() {
            const response = await fetch(buildPath(`api/card/${cardId}`));
            const txt = await response.text();
            const data = JSON.parse(txt);
            setCard(data.card);
        }
        fetchCard();
    }, [cardId]);

    if (!card) return <p>Loading...</p>;

    return (
        <div className='flex flex-col items-center gap-4'>
            <h1 className='text-2xl font-bold'>{card.name}</h1>
            <img src={card.imageUrl} alt={card.name} className='h-96 rounded-md' />
            <p>{card.typeLine}</p>
            <p>Rarity: {card.rarity}</p>
            <p>Set: {card.setName}</p>
            <p>Artist: {card.artist}</p>
        </div>
    );
}

export default CardDetails;