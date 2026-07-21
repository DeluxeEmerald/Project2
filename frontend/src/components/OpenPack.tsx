import React, { useState, useEffect, useCallback } from 'react';
import { storeToken, retrieveToken, clearToken, retrieveUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';
function OpenPack()
{

    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [showPack, setShowPack] = useState(true);
    const [showButtons, setShowButtons] = useState(false);
    const [cardsObtained, setCards] = useState<cardObject[]>([]);

    const navigate = useNavigate();

    const dynamicValue = window.innerWidth / 5; 

    interface cardEntry {
        name: string;
        html: string;
    }

    interface cardObject
    {
        id:            string,
        name:          string,
        manaCost:      string,
        cmc:           string,
        colors:        string,
        colorIdentity: string,
        typeLine:      string,
        oracleText:    string,
        power:         string,
        toughness:     string,
        loyalty:       string,
        rarity:        string,
        setName:       string,
        setCode:       string,
        artist:        string,
        imageUrl:      string,
        comBan:        string,
        gamechanger:   string
    }

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

    async function searchCard(searchTerm: string, sampleSize: string): Promise<cardEntry[]> {
        let obj = {jwtToken: retrieveToken(), search: searchTerm, sample: sampleSize };
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(buildPath('api/searchcards'),
            {method:'POST',body:js,headers:{'Content-Type':
            'application/json'}});
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            if(res.error && res.error.length > 0){
                setMessage(res.error);
            }
            else{
                storeToken(res.jwtToken);
                setResults(res.results);
            }
            let _results = res.results;
            
            if (_results && _results.length > 0) {
                const randomIndex = Math.floor(Math.random() * _results.length);
                _results = [_results[randomIndex]];
            }

            var cardList: cardEntry[] = [];
            if (cardList) {
                _results.forEach((element: any) => {
                    const cardAdd = document.createElement('div');
                    cardAdd.className = 'card';
                    cardAdd.innerHTML = `
                        <img src="${element.imageUrl}" alt="${element.name}" class='h-60 w-40 rounded-md'>`;
                    cardList.push({ "name":cardAdd.className, "html":cardAdd.innerHTML });

                    setCards(prev => [...prev, element]);
                });
            }
            return cardList;
        }
        catch (error: any) {
            console.log("Error");
            setResults(error.toString());
            return [];
        }
    }

    async function addCardToUser(cardID:string): Promise<void> {
        const userID = JSON.parse(retrieveUserID()).id;
        let obj = { jwtToken: retrieveToken(), userID:userID, cardID:cardID, total:"1" };
        let js = JSON.stringify(obj);

         try
        {
            const response = await fetch(buildPath('api/addinventory'),
            {method:'POST',body:js,headers:{'Content-Type':
            'application/json'}});
            
            let txt = await response.text();
            let res = JSON.parse(txt);

            if(res.error && res.error.length > 0){
                setMessage(res.error);
            }
            else{
                storeToken(res.jwtToken);
            }
        }
        catch (error: any) {
            console.log(error);
        }
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
    async function pullType(cardType: any, cardNum: any): Promise<cardEntry[]> {
        var cardsPulled: cardEntry[] = [];
        for (var i = 0; i < cardNum; i++) {
            var pulledCard = await searchCard(cardType, "1");
            cardsPulled = [...cardsPulled, ...pulledCard];
        }
        return cardsPulled;
    }


    const pullCards = useCallback(async () => {
        // Fetch data for card types
        const uncommon = await pullType("uncommon", cards.uncommon);
        const rare = await pullType("rare", cards.rare);
        const mythic = await pullType("mythic", cards.mythic);

        var container = document.getElementById("cardList") as HTMLDivElement;

        if (!container) return;

        const cardHTMLs: HTMLDivElement[] = [];

        // Process Uncommons
        uncommon.forEach((card) => {
            
            const cardHTMLAdd = document.createElement('div');
            cardHTMLAdd.className = "card";
            cardHTMLAdd.innerHTML = card.html;
            cardHTMLs.push(cardHTMLAdd);
        });

        // Process Rares
        rare.forEach((card) => {
            const cardHTMLAdd = document.createElement('div');
            cardHTMLAdd.className = "card";
            cardHTMLAdd.innerHTML = card.html;
            cardHTMLs.push(cardHTMLAdd);
        });

        // Process Mythic
        if (mythic && mythic[0]) {
            const cardHTMLAdd = document.createElement('div');
            cardHTMLAdd.className = "card";
            cardHTMLAdd.innerHTML = mythic[0].html;
            cardHTMLs.push(cardHTMLAdd);
        }

        // Apply styles/animations
        cardHTMLs.forEach((card, index) => {
            card.style.setProperty('--slide-distance', `${dynamicValue * - (index - 2) / 2}px`);
            card.style.setProperty("animation-name", "unfurlCardsFromCenterAnimation");
            card.style.setProperty("animation-duration", "3s");
            card.style.setProperty("animation-fill-mode", "forwards");
            card.style.setProperty("display", "none");
        });

        container.append(...cardHTMLs);
    }, [cards, dynamicValue]);

    const handleAnimationEnd = async () => {
        setShowPack(false);
        await new Promise(resolve => setTimeout(resolve, 10));
        var container = document.getElementById("cardList") as HTMLDivElement;  
        Array.from(container?.children).forEach(child => {
            (child as HTMLElement).style.setProperty("display", "inline");
        });
        setShowButtons(true);
    };

    const hasPulled = React.useRef(false);

    function toPacks(e:any) {
        e.preventDefault();
        navigate('/packs');
    }

    async function toInventoryWithCards(e:any) {
        e.preventDefault();
        cardsObtained.forEach(card => {
            addCardToUser(card.id);
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/inventory');
    }

    useEffect(() => {
        if (hasPulled.current) {
        return;
        }
        hasPulled.current = true;
        pullCards();
    }, []);
        
    return(
    <div id="cardUIDiv" style={{paddingBottom:"150px"}} className='rounded-3xl w-full flex flex-col items-center justify-center'>
            <h1 style={{color:"black", marginBottom:"126px"}}>These cards were added to your inventory:</h1>
            {showPack && (<img id='packImage' onAnimationEnd={handleAnimationEnd} style={{ animation:"forwards", animationName:"rotatePackAnimation", animationDuration:"3s", transformOrigin:"center center", maxWidth: '20%'}} src='src/assets/pack.png' alt="March of the Machine Epilogue Booster Pack"></img>)}
            <div id='cardList' className='flex flex-wrap gap-2 justify-center'></div>
            {showButtons && <div id='buttons'>
                <button className='bg-black text-white flex-1 w-32 h-16 rounded-full m-[20px]' onClick={toInventoryWithCards}>Accept Cards</button>
                <button className='bg-black text-white flex-1 w-32 h-16 rounded-full m-[20px]' onClick={toPacks}>Reject Cards</button>
            </div>}
    </div>
    );
}
export default OpenPack;