import {useState, useRef, useEffect} from 'react';
import { buildPath } from './Path';
import { storeToken, retrieveToken, retrieveUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';

const Inventory = ({ onCardClick, inventoryOnly }: {
    onCardClick?: (card: any) => void;
    inventoryOnly?: boolean;
}) => {

    let _ud : any = retrieveUserID();
    let ud = JSON.parse(_ud);
    let userId : string = ud.id;
    const [searchResults,setResults] = useState('');
    const [search,setSearchValue] = useState('');
    const [message, setMessage] = useState('');
    const isTrueSortRef = useRef(false);
    const isFilterOptionsRef = useRef(false);
    const hasLoaded = useRef(false);
    const inventoryCardIdsRef = useRef<Set<string>>(new Set());
    const navigate = useNavigate();

    function normalizeObjectId(value: any): string {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && typeof value.$oid === 'string') return value.$oid;
        if (typeof value.toHexString === 'function') return value.toHexString();
        const asString = String(value);
        return asString === '[object Object]' ? '' : asString;
    }

    async function refreshInventoryCardIds(): Promise<void> {
        const obj = {jwtToken: retrieveToken(), userID: userId};
        const response = await fetch(buildPath('api/getinventory'),
            {method:'POST',body:JSON.stringify(obj),headers:{'Content-Type':'application/json'}});

        const txt = await response.text();
        const res = JSON.parse(txt);

        if(res.error && res.error.length > 0){
            throw new Error(res.error);
        }

        storeToken(res.jwtToken);
        const cardIds = new Set<string>();
        (res.results || []).forEach((element: any) => {
            const normalizedId = normalizeObjectId(element.id ?? element.cardId ?? element._id);
            if (normalizedId.length > 0) {
                cardIds.add(normalizedId);
            }
        });
        inventoryCardIdsRef.current = cardIds;
    }

    function ImageButton(imageSrc:string, cardName:string) : string {
    return `
        <button class="inventory-card-button" >
        <img src="${imageSrc}" alt="${cardName}" class="inventory-card-image" />
        </button>
        `;
    }


    async function searchCard(e:any) : Promise<void>
    {
        if (e)
            e.preventDefault();
        let obj = {jwtToken: retrieveToken(), search: search};
        let obj2 = {jwtToken: retrieveToken(), userID: userId, search: search};
        let js = JSON.stringify(obj);
        let js2 = JSON.stringify(obj2);
        
        try
        {
            const selectedInventory = document.getElementById('owned') as HTMLInputElement | null;
            var isSearchingInv = true;
            if (!inventoryOnly && selectedInventory) isSearchingInv = selectedInventory.checked;

            let response = null;

            await refreshInventoryCardIds();

            if(isSearchingInv){
                response = await fetch(buildPath('api/searchinventory'),
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

            _results = _results.map((element: any) => ({
                ...element,
                id: normalizeObjectId(element.id ?? element.cardId ?? element._id)
            }));

            _results.sort(getSortComparator());
            
            const container = document.getElementById('cardList');
            if (container) {
                container.innerHTML = '';

                _results.forEach((element: any) => {
                    if(checkFilter(element.typeLine, element.rarity)) {
                        const isOwned = inventoryCardIdsRef.current.has(element.id);
                        const cardAdd = document.createElement('div');
                        cardAdd.className = `inventory-card ${isOwned ? '' : 'inventory-card-disabled'}`;
                        cardAdd.innerHTML = `
                            ${ImageButton(element.imageUrl, element.name)}
                            <div class="inventory-card-name">${element.name}</div>
                            <div class="inventory-card-meta">${element.typeLine}</div>
                            <div class="inventory-card-status ${isOwned ? 'inventory-card-status-owned' : 'inventory-card-status-locked'}">${isOwned ? 'In inventory' : 'Not in inventory'}</div>
                        `;

                        cardAdd.querySelector('button')?.addEventListener('click', () => {
                            toCardDetails(element);
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
        setSearchValue(e.target.value);
    }

    function checkFilter(typeLine: string,rarity: string): boolean{
        const typeId = ['creature', 'land', 'instant', 'sorcery', 'artifact', 'enchantment', 'planeswalker'];
        const rarityId = ['common', 'uncommon', 'rare', 'mythic'];

        const selectedTypes = typeId.filter(id =>
            (document.getElementById(id) as HTMLInputElement)?.checked
        );
        const selectedRarities = rarityId.filter(id =>
            (document.getElementById(id) as HTMLInputElement)?.checked
        );

        const typeMatch = selectedTypes.length === 0 ||
            selectedTypes.some(x => (typeLine || '').toLowerCase().includes(x));

        const rarityMatch = selectedRarities.length === 0 ||
            selectedRarities.includes((rarity || '').toLowerCase());

        return typeMatch && rarityMatch;
    }

    function showSort(){
        const container = document.getElementById('sortOption');
        if (!container) return;

        if(!isTrueSortRef.current){
            if (!container.hasChildNodes()){
                container.className ='flex justify-center items-center';

                const list = document.createElement('div');
                list.className = 'inventory-popover';
                list.innerHTML = `
                <div class="inventory-popover-title">Sort cards</div>
                <div class="inventory-option-list">
                <div class="inventory-option">
                    <input type="radio" id="alphabet" name="sortOption" class="w-4 h-4">
                    <label for="alphabet" class="text-sm whitespace-nowrap">Alphabet</label>
                </div>
                <div class="inventory-option">
                    <input type="radio" id="manaCost" name="sortOption" class="w-4 h-4">
                    <label for="manaCost" class="text-sm whitespace-nowrap">Mana Cost</label>
                </div>
                <div class="inventory-option">
                    <input type="radio" id="rarity" name="sortOption" class="w-4 h-4">
                    <label for="rarity" class="text-sm whitespace-nowrap">Rarity</label>
                </div>
                <div class="inventory-option">
                    <input type="radio" id="color" name="sortOption" class="w-4 h-4">
                    <label for="color" class="text-sm whitespace-nowrap">Color</label>
                </div>
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
            return (a, b) => (rarityOrder[(a.rarity || '').toLowerCase()] ?? 99) -
                            (rarityOrder[(b.rarity || '').toLowerCase()] ?? 99);
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
                list.className = 'inventory-popover';
                list.innerHTML = `
                <div class='inventory-popover-title'>Filter cards</div>
                <div class='inventory-option-list'>
                <p class='inventory-popover-title'>Ownership</p>
                <div class="inventory-option">
                    <input type="checkbox" id="owned" value="owned" class="w-4 h-4" checked>
                    <label for="owned" class="text-sm">In Inventory</label>
                </div>
                <p class='inventory-popover-title'>Type</p>
                <div class='inventory-option-grid'>
                <div class="inventory-option"><input type="checkbox" id="creature" value="creature" class="w-4 h-4"><label for="creature" class="text-sm">Creature</label></div>
                <div class="inventory-option"><input type="checkbox" id="land" value="land" class="w-4 h-4"><label for="land" class="text-sm">Land</label></div>
                <div class="inventory-option"><input type="checkbox" id="instant" value="instant" class="w-4 h-4"><label for="instant" class="text-sm">Instant</label></div>
                <div class="inventory-option"><input type="checkbox" id="sorcery" value="sorcery" class="w-4 h-4"><label for="sorcery" class="text-sm">Sorcery</label></div>
                <div class="inventory-option"><input type="checkbox" id="artifact" value="artifact" class="w-4 h-4"><label for="artifact" class="text-sm">Artifact</label></div>
                <div class="inventory-option"><input type="checkbox" id="enchantment" value="enchantment" class="w-4 h-4"><label for="enchantment" class="text-sm">Enchantment</label></div>
                <div class="inventory-option"><input type="checkbox" id="planeswalker" value="planeswalker" class="w-4 h-4"><label for="planeswalker" class="text-sm">Planeswalker</label></div>
                </div>
                <p class='inventory-popover-title'>Rarity</p>
                <div class='inventory-option-grid'>
                <div class="inventory-option"><input type="checkbox" id="common" value="common" class="w-4 h-4"><label for="common" class="text-sm">Common</label></div>
                <div class="inventory-option"><input type="checkbox" id="uncommon" value="uncommon" class="w-4 h-4"><label for="uncommon" class="text-sm">Uncommon</label></div>
                <div class="inventory-option"><input type="checkbox" id="rare" value="rare" class="w-4 h-4"><label for="rare" class="text-sm">Rare</label></div>
                <div class="inventory-option"><input type="checkbox" id="mythic" value="mythic" class="w-4 h-4"><label for="mythic" class="text-sm">Mythic</label></div>
                </div>
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

    function toCardDetails(card: any) {
        if (onCardClick) {
            onCardClick(card);
        } else {
            navigate(`/card/${card.id}`, { state: { card } });
        }
    }

    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;
        searchCard(null);
    }, []);
    
    return(
    <div id="cardUIDiv" className='inventory-shell flex items-center justify-center flex-col text-black gap-6'>
        <div className='inventory-header w-full'>
            <div>
                <p className='brand-mark'>Inventory</p>
                <h2 className='inventory-title'>Browse your collection</h2>
            </div>
            <p className='inventory-subtitle'>Search owned cards, sort the results, and filter by type or rarity from a cleaner card browser.</p>
        </div>

        <div className='inventory-toolbar w-full'>
            <div className='inventory-search'>
                <label className='inventory-field'>
                    <span className='field-label'>Search cards</span>
                    <input type="text" id="searchText" placeholder="Search by card name, type, set, or artist" onChange={handleSearchTextChange} onKeyDown={e => {if (e.key === 'Enter') searchCard(e);}}
                    className='text-input' />
                </label>
                <button type="button" id="searchCardButton" className="primary-button"
                    onClick={searchCard}>Search</button>
            </div>

            <div className='inventory-actions'>
                <button type="button" id="Sort" className="secondary-button"
                    onClick={showSort}>Sort</button>
                <button type="button" id="Filter" className="secondary-button"
                    onClick={showFilterOptions}>Filter</button>
            </div>
        </div>

        <div className='inventory-popover-row w-full'>
            <div id='sortOption'></div>
            <div id='filterOption'></div>
        </div>
        <div className='inventory-status'>
            {searchResults && <span id="cardSearchResult" className='inventory-pill'>{searchResults}</span>}
            {message && <span className='inventory-pill'>{message}</span>}
        </div>
        <p id="cardList" className='inventory-grid w-full'></p>
    </div>
    );
};
export default Inventory;