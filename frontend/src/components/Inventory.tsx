import React, {useState, useRef} from 'react';
import { buildPath } from './Path';
import { storeToken, retrieveToken, clearToken, retrieveUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';


function Inventory()
{

    let _ud : any = retrieveUserID();
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;
    const [searchResults,setResults] = useState('');
    const [search,setSearchValue] = React.useState('');
    const [message, setMessage] = useState('');
    const isTrueSortRef = useRef(false);
    const isFilterOptionsRef = useRef(false);
    const navigate = useNavigate();

    function ImageButton(imageSrc:string, cardName:string) : string {
    return `
    <button class="overflow-hidden rounded-md h-60 w-40" >
      <img src="${imageSrc}" alt="${cardName}" class="w-full h-full object-cover" />
    </button>
    `;
    }


    async function searchCard(e:any) : Promise<void>
    {
        e.preventDefault();
        let obj = {jwtToken: retrieveToken(), search: search};
        let obj2 = {jwtToken: retrieveToken(), userID: userId, search: search};
        let js = JSON.stringify(obj);
        let js2 = JSON.stringify(obj2);
        
        try
        {
            const selectedInventory = document.getElementById("owned") as HTMLInputElement | null;
            let response = null;

            if(selectedInventory?.checked){
                response = await fetch(buildPath('api/getinventory'),
                {method:'POST',body:js2,headers:{'Content-Type':
                'application/json'}});
            }
            else{
                response = await fetch(buildPath('api/searchcards'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
            }
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            if(res.error && res.error.length > 0){
                setMessage(res.error);
            }
            else{
                storeToken(res.jwtToken);
            }

            let _results = res.results;
            _results.sort(getSortComparator());
            
            const container = document.getElementById('cardList');
            if (container) {
                container.innerHTML = '';

                _results.forEach((element: any) => {
                    if(checkFilter(element.typeLine, element.rarity)){
                        const cardAdd = document.createElement('div');
                        cardAdd.className = 'card';
                        cardAdd.innerHTML = ImageButton(element.imageUrl, element.name);ImageButton

                        cardAdd.querySelector('button')?.addEventListener('click', () => {
                            navigate('/cardinfo');
                        });

                        container.appendChild(cardAdd);
                    }
                });
            }
        }
        catch(error:any)
        {
            setResults(error.toString());
        }
    };

    function handleSearchTextChange( e: any ) : void{
        setSearchValue( e.target.value );
    }

    function checkFilter(typeLine: string,rarity: string): boolean{
        const typeId = ['creature', 'land', 'instant', 'sorcery', 'artifact', 'enchantment', 'planeswalker']
        const rarityId = ['common', 'uncommon', 'rare', 'mythic']

        
        const selectedTypes = typeId.filter(id =>
            (document.getElementById(id) as HTMLInputElement)?.checked
        );
        const selectedRarities = rarityId.filter(id =>
            (document.getElementById(id) as HTMLInputElement)?.checked
        );

        const typeMatch = selectedTypes.length === 0 ||
            selectedTypes.some(x => typeLine.toLowerCase().includes(x));

        const rarityMatch = selectedRarities.length === 0 ||
            selectedRarities.includes(rarity.toLowerCase());

        return typeMatch && rarityMatch;
    }

    function showSort(){
        const container = document.getElementById('sortOption');
        if (!container) return;

        if(!isTrueSortRef.current){
            if (!container.hasChildNodes()){
                container.className ='flex justify-center items-center';

                const list = document.createElement('div');
                list.className = 'flex flex-col gap-2 w-40 p-3 rounded-md';
                list.innerHTML = `
                <div class="flex items-center gap-1">
                    <input type="radio" id="alphabet" name="sortOption" class="w-4 h-4">
                    <label for="alphabet" class="text-sm whitespace-nowrap">Alphabet</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="radio" id="manaCost" name="sortOption" class="w-4 h-4">
                    <label for="manaCost" class="text-sm whitespace-nowrap">Mana Cost</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="radio" id="rarity" name="sortOption" class="w-4 h-4">
                    <label for="rarity" class="text-sm whitespace-nowrap">Rarity</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="radio" id="color" name="sortOption" class="w-4 h-4">
                    <label for="color" class="text-sm whitespace-nowrap">Color</label>
                </div>
                `;
                container.appendChild(list);
            }
            container.style.display = 'flex';
            isTrueSortRef.current = true;
        }
        else{
            container.style.display = 'none';
            isTrueSortRef.current = false;
        }
    }
        

    function getSortComparator(): (a: any, b: any) => number {
        const rarityOrder: Record<string, number> = {
            common: 0, uncommon: 1, rare: 2, mythic: 3
        };
        const colorOrder: Record<string, number> = {
            W: 0, U: 1, B: 2, R: 3, G: 4
        };

        if ((document.getElementById('alphabet') as HTMLInputElement)?.checked) {
            return (a, b) => a.name.localeCompare(b.name);
        }

        if ((document.getElementById('manaCost') as HTMLInputElement)?.checked) {
            return (a, b) => a.cmc - b.cmc;
        }

        if ((document.getElementById('rarity') as HTMLInputElement)?.checked) {
            return (a, b) => (rarityOrder[a.rarity.toLowerCase()] ?? 99) -
                            (rarityOrder[b.rarity.toLowerCase()] ?? 99);
        }

        if ((document.getElementById('color') as HTMLInputElement)?.checked) {
            return (a, b) => {
                const aColor = a.colors?.[0] ? colorOrder[a.colors[0]] : 99;
                const bColor = b.colors?.[0] ? colorOrder[b.colors[0]] : 99;
                return aColor - bColor;
            };
        }

        return () => 0;
    }

    function showFilterOptions(){
        const container = document.getElementById('filterOption');
        if (!container) return;

        
        if(!isFilterOptionsRef.current){
            if(!container.hasChildNodes()){
                container.className ='flex justify-center items-center';

                const list = document.createElement('div');
                list.className = 'grid grid-cols-2 gap-x-4 gap-y-2 w-86 p-3 rounded-md';
                list.innerHTML = `
                <p class='col-span-2'>Ownership</p>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="owned" value="owned" class="w-4 h-4">
                    <label for="owned" class="text-sm">In Inventory</label>
                </div>
                <div class="flex items-center gap-1">
                </div>
                    <p class='col-span-2 justify-center'>Type</p>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="creature" value="creature" class="w-4 h-4">
                    <label for="creature" class="text-sm">Creature</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="land" value="land" class="w-4 h-4">
                    <label for="land" class="text-sm">Land</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="instant" value="instant" class="w-4 h-4">
                    <label for="instant" class="text-sm">Instant</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="sorcery" value="sorcery" class="w-4 h-4">
                    <label for="sorcery" class="text-sm">Sorcery</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="artifact" value="aritfact" class="w-4 h-4">
                    <label for="artifact" class="text-sm">Artifact</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="enchantment" value="enchantment" class="w-4 h-4">
                    <label for="enchantment" class="text-sm">Enchantment</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="planeswalker" value="planeswalker" class="w-4 h-4">
                    <label for="planeswalker" class="text-sm">Planeswalker</label>
                </div>
                <p class='col-span-2'>Rarity</p>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="common" value="common" class="w-4 h-4">
                    <label for="common" class="text-sm">Common</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="uncommon" value="uncommon" class="w-4 h-4">
                    <label for="uncommon" class="text-sm">Uncommon</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="rare" value="rare" class="w-4 h-4">
                    <label for="rare" class="text-sm">Rare</label>
                </div>
                <div class="flex items-center gap-1">
                    <input type="checkbox" id="mythic" value="mythic" class="w-4 h-4">
                    <label for="mythic" class="text-sm">Mythic</label>
                </div>
                `;
                container.appendChild(list);
            }

            container.style.display = 'flex';
            isFilterOptionsRef.current = true;
        }
        else{
            container.style.display = 'none';
            isFilterOptionsRef.current = false;
        }
    }

    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex items-center justify-center flex-col text-black gap-4 font-grover'>
        <p className='text-black text-xl'>Inventory</p>
            <div>
            Search: <input type="text" id="searchText" placeholder="Card To Search For" onChange={handleSearchTextChange} 
            className='bg-white' />
            <button type="button" id="searchCardButton" className="bg-main hover:bg-accent2 rounded-full w-32 ml-4"
                onClick={searchCard}> Search Card</button>
        </div>

        <div className='flex flex-col items-center gap-2'>
            <div>
                <button type="button" id="Sort" className="bg-main hover:bg-accent2 w-32"
                    onClick={showSort}> Sort</button>   
                <button type="button" id="Filter" className="bg-main hover:bg-accent2 w-32"
                    onClick={showFilterOptions}> Filter</button>
            </div>

            <div className='flex flex-row gap-2'>
                <div id='sortOption' className=''></div>   
                <div id='filterOption' className=''></div>
            </div>
        </div>
        <span id="cardSearchResult">{searchResults}</span>
        <span >{message}</span>
        <p id="cardList" className='flex flex-wrap gap-2 justify-center mb-4' ></p>
    </div>
    );
}
export default Inventory;