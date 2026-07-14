import React, { useState, useEffect } from 'react';
function OpenPack()
{

    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;
    // let firstName : string = ud.firstName;
    // let lastName : string = ud.lastName;
    const [pulledText, setPulledText] = useState('');
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [cardList,setCardList] = useState('');
    const [search,setSearchValue] = React.useState('');
    const [card,setCardNameValue] = React.useState('');

    const app_name = 'cop4331-89.xyz';
    function buildPath(route: string): string
    {
        if (import.meta.env.MODE != 'development')
        {
            return 'http://' + app_name + ':5000/' + route;
        }
        else
        {
            return 'http://localhost:5000/' + route;
        }
    }

    async function searchCard(searchTerm: string): Promise<string> {
        let obj = { userId: userId, search: searchTerm };
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(buildPath('api/searchCards'),
            {method:'POST',body:js,headers:{'Content-Type':
            'application/json'}});
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            let _results = res.results;
            let resultText = '';
            
            _results.forEach((element: any) => {
                resultText += `${element.name}`;
            });
            return resultText;
        }
        catch (error: any) {
            alert(error.toString());
            setResults(error.toString());
            return '';
        }
    }

    function handleSearchTextChange( e: any ) : void
    {
        setSearchValue( e );
    }

    function pullCardRarities() {
        const mythic_roll = Math.random() * 100;
        const rare_roll = Math.random() * 100;
        const num_mythics = mythic_roll < 1 ? 1 : 0;
        const num_rares = num_mythics == 1 ? (rare_roll < 27 ? 2 : 1) : (rare_roll < 2 ? 3 : rare_roll < 29 ? 2 : 1);
        const num_uncommons = 5 - num_mythics - num_rares;

        return { "uncommon": num_uncommons, "rare": num_rares, "mythic": num_mythics }
    }

    const cards = pullCardRarities();

   // helper is now just a plain async function, no hooks inside
    async function pullType(cardType: any, cardNum: any): Promise<string> {
        var cardsPulled = "";
        for (var i = 0; i < cardNum; i++) {
            var pulledCard = await searchCard(cardType);
            cardsPulled += (i < cardNum - 1) ? (pulledCard + ", ") : pulledCard;
        }
        return cardsPulled;
    }

    // single useEffect at top level does the actual work
    useEffect(() => {
        async function pullCards() {
            const uncommon = await pullType("uncommon", cards.uncommon);
            const rare = await pullType("rare", cards.rare);
            const mythic = await pullType("mythic", cards.mythic);
            setPulledText("Uncommon:" + uncommon + " Rare:" + rare + " Mythic:" + mythic);
        }
        pullCards();
    }, []);
    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex flex-col items-center justify-center'>
            <img style={{ animation:"forwards", animationName:"rotatePackAnimation", animationDuration:"3s", transformOrigin:"center center", marginTop:"126px", maxWidth: '20%', marginBottom:"150px" }} src='src/assets/pack.png' alt="March of the Machine Epilogue Booster Pack"></img>
            <p style={{color:"black"}}>{JSON.stringify(cards)}</p>
            <p id='cardList' style={{color:"black"}}>{pulledText}</p>
    </div>
    );
}
export default OpenPack;