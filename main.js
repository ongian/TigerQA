//Check SKUs of exclusive Deals and Campaign Page
const QAPage = async(campaignID) => {
    try{
        let productArray = [];
        let EDPs = [];
        const response = await fetch(`https://stark-brushlands-36367.herokuapp.com/https://www.tigerdirect.com/applications/campaigns/deals.asp?campaignid=${campaignID}`);
        const responseText = await response.text();
        const parser = new DOMParser();
        const parsedHTML = parser.parseFromString(responseText, 'text/html');
        const eachProduct = parsedHTML.querySelectorAll('.product-container .product');
        document.querySelector('.qa-results').innerHTML = `<div class="loader"></div>`;
        let progress = '';
        
        let dummyFeaturedProduct = [];
        let featuredProductEDP = [];

        const skuLinks = parsedHTML.querySelectorAll('.mainContent a[href*="/applications/SearchTools/item-details.asp?EdpNo="]');
        for(i = 0; i < skuLinks.length; i++){
            const urlParams = new URLSearchParams(skuLinks[i].href.split('?')[1]);
            !skuLinks[i].closest(`.product-container .product[data-edpno="${urlParams.get('EdpNo')}"]`) ? dummyFeaturedProduct.push(urlParams.get('EdpNo')) : null;
        }

        featuredProductEDP = Array.from(new Set(dummyFeaturedProduct));
        console.log(featuredProductEDP)
        for(i = 0; i < eachProduct.length; i++){
            progress = `${i} / ${eachProduct.length}`;

            const PDPData = await QASku(eachProduct[i].dataset.edpno);

            
            //Check if has list Price
            const CPMapPrice = eachProduct[i].querySelector('.salePrice .mapprice');
            const CPMapPriceB = eachProduct[i].querySelector('.salePrice .mappriceb');
            const CPPriceDisplay = eachProduct[i].querySelector('.salePrice') ? eachProduct[i].querySelector('.salePrice') : null;

            const ifListPriceHidden = CPMapPriceB ? true : false;
            const splitPrice = CPPriceDisplay && !ifListPriceHidden ? await CPPriceDisplay.innerText.replace(/(\s|,)/g, '').split('$') : null;

            const newFinalPrice = !splitPrice ? 'Price Hidden' : (CPMapPrice ? '' : Number(splitPrice[splitPrice.length - 1].replace(/[^\d.-]/g, '')).toFixed(2));
            const newListPrice = splitPrice  ? (CPMapPrice ? Number(splitPrice[splitPrice.length - 1]).toFixed(2) : Number(splitPrice[splitPrice.length - 2]).toFixed(2)) : '';


            const skuData = {
                PDPData,
                CPPrice: newFinalPrice,
                CPLP: newListPrice
            }
            EDPs.push(skuData)
            document.querySelector('.progress').innerHTML = `<span>Checking ${i} / ${eachProduct.length}</span>`;
        }
        console.log(EDPs)
        if(EDPs.length > 0){
            tableContent = EDPs.map(skuArr => `<tr>
                <td> ${skuArr.PDPData.category}</td>
                <td><a href="https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=${skuArr.PDPData.edp}" target="_blank">${skuArr.PDPData.sku}</a></td>
                <td class="price"><div class="page-price">${skuArr.CPLP != 0.00 ? (skuArr.PDPData.LPInfo === skuArr.CPLP ? '<del>'+skuArr.CPLP+'</del>' : '<del class="not-match">'+skuArr.CPLP+'</del>') : ''} <span class="${skuArr.PDPData.priceInfo !== skuArr.CPPrice ? 'not-match' : ''}">${skuArr.CPPrice}</span> </div> <div class="pdp-price">${skuArr.PDPData.LPInfo && '<del>'+skuArr.PDPData.LPInfo+'</del>'} ${skuArr.PDPData.priceInfo == 'No Price' ? 'No Price' : skuArr.PDPData.priceInfo}</div></td>
                <td><span class=${skuArr.PDPData.stock === 'Out of stock' ? 'out-of-stock' : 'in-stock'}>${skuArr.PDPData.stock}</span></td>
                <td>${skuArr.PDPData.condition}</td>
                <td><span class=${skuArr.PDPData.skuType === 'YES' ? 'cnet' : ''}>${skuArr.PDPData.skuType}</span></td>
                <td><span class=${skuArr.PDPData.shipping === 'FREE' ? 'free' : ''}>${skuArr.PDPData.shipping}</span></td>
                <td><span class=${skuArr.PDPData.rating === 'No Reviews' ? 'no-review' : (skuArr.PDPData.rating < 4 ? 'less-4' : 'good')}>${skuArr.PDPData.rating}</span></td>
            </tr>`).join('');
            document.querySelector('.qa-results').innerHTML = `<table cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <th>Category</th>
            <th>SKU #</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Condition</th>
            <th>CNET</th>
            <th>Shipping Fee</th>
            <th>Rating</th>
        </tr> ${tableContent} </table>`;
            document.querySelector('.progress').innerHTML = '';
        } else {
            document.querySelector('.qa-results').innerHTML = `<h3>Unable to retreive data from https://www.tigerdirect.com/applications/campaigns/deals.asp?campaignid=${campaignID}</h3>`
        }
        
        
    } catch(err){
        console.log(err)
    }
}

//Check SKUs of PC Gaming Campaign Page Only
const QAPCGaming = async(campaignID) => {
    try {
        let featuredArr = [];
        const response = await fetch(`https://stark-brushlands-36367.herokuapp.com/https://www.tigerdirect.com/applications/campaigns/deals.asp?campaignid=${campaignID}`);
        const responseText = await response.text();
        const parser = new DOMParser();
        const parsedHTML = parser.parseFromString(responseText, 'text/html');
        const eachFeatured = parsedHTML.querySelectorAll('.td-esports .container .featured');
        document.querySelector('.qa-results').innerHTML = `<div class="loader"></div>`;

        for(var i = 0; i < eachFeatured.length; i++){
            document.querySelector('.progress').innerHTML = `<span>Checking Featured Category ${i} / ${eachFeatured.length}</span>`;
            const category = eachFeatured[i].querySelector('.header h2').innerText;
            const featuredSkuLink = eachFeatured[i].querySelector('.featured-banner a').href;
            const params = new URLSearchParams(featuredSkuLink.split('?')[1]);
            const featuredSkuEdpno = params.get('EdpNo');
            const subFeaturedSku = eachFeatured[i].nextElementSibling.querySelectorAll('.sku > a');
            const subFeaturedSKUArr = [];
            for(var ii = 0; ii < subFeaturedSku.length; ii++){
                const subParams = new URLSearchParams(subFeaturedSku[ii].href.split('?')[1]);
                const subFeaturedEDP = subParams.get('EdpNo');
                subFeaturedSKUArr.push(await QASku(subFeaturedEDP))
            }
            featuredArr.push({
                category: category,
                edpno: await QASku(featuredSkuEdpno),
                sub: subFeaturedSKUArr
            });
        }
        const tableContent = featuredArr.map(skuArr => 
            `<tr>
                <td colspan="7">${skuArr.category}</td>
            </tr>
            <tr>
                <td><i class="fas fa-copy" onclick="${getSku.bind(this, skuArr.edpno.edp, skuArr.edpno.sku, skuArr.edpno.category)}"></i> ${skuArr.edpno.category}</td>
                <td><a href="https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=${skuArr.edpno.edp}" target="_blank">${skuArr.edpno.sku}</a></td>
                <td><span class=${skuArr.edpno.stock === 'Out of stock' ? 'out-of-stock' : 'in-stock'}>${skuArr.edpno.stock}</span></td>
                <td>${skuArr.edpno.condition}</td>
                <td><span class=${skuArr.edpno.skuType === 'YES' ? 'cnet' : ''}>${skuArr.edpno.skuType}</span></td>
                <td><span class=${skuArr.edpno.shipping === 'FREE' ? 'free' : ''}>${skuArr.edpno.shipping}</span></td>
                <td><span class=${skuArr.edpno.rating === 'No Reviews' ? 'no-review' : (skuArr.edpno.rating < 4 ? 'less-4' : 'good')}>${skuArr.edpno.rating}</span></td>
            </tr>
            ${skuArr.sub.map(subSKU => `<tr>
                <td><i class="fas fa-copy" onclick="${getSku.bind(this, subSKU.edp, subSKU.sku, subSKU.category)}"></i> ${subSKU.category}</td>
                <td><a href="https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=${subSKU.edp}" target="_blank">${subSKU.sku}</a></td>
                <td><span class=${subSKU.stock === 'Out of stock' ? 'out-of-stock' : 'in-stock'}>${subSKU.stock}</span></td>
                <td>${subSKU.condition}</td>
                <td><span class=${subSKU.skuType === 'YES' ? 'cnet' : ''}>${subSKU.skuType}</span></td>
                <td><span class=${subSKU.shipping === 'FREE' ? 'free' : ''}>${subSKU.shipping}</span></td>
                <td><span class=${subSKU.rating === 'No Reviews' ? 'no-review' : (subSKU.rating < 4 ? 'less-4' : 'good')}>${subSKU.rating}</span></td>
            </tr>`).join('') }
            `).join('');
            
        document.querySelector('.qa-results').innerHTML = `<table cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <th>Category</th>
            <th>SKU #</th>
            <th>Stock</th>
            <th>Condition</th>
            <th>CNET</th>
            <th>Shipping Fee</th>
            <th>Rating</th>
        </tr> ${tableContent} </table>`;
        console.log(featuredArr)
    } catch(error) {
        console.log(error)
    }
}




//Check Each SKU and returns SKUs Statuses
const QASku = async(edp) => {
    try {
        const response = await fetch(`https://stark-brushlands-36367.herokuapp.com/https://www.tigerdirect.com/applications/searchtools/item-Details.asp?EdpNo=${edp}`);
        const skuResponse = await response.text();
        const parser = new DOMParser();
        const parsedSku = parser.parseFromString(skuResponse, 'text/html');

        //Get Final Price
        const pdpFinalPrice = parsedSku.querySelector('.pdp-info .final-price .sale-price .sr-only');
        const finalPrice = pdpFinalPrice ? Number(pdpFinalPrice.innerText.replace(/(cents|\s|$|,)/g, '').replace(/and/g, '.').slice(1)).toFixed(2) : 'Price Hidden';
       
        //Get List Price
        const pdpListPrice = parsedSku.querySelector('.pdp-info .list-price .sr-only');
        const listPrice = pdpListPrice ? Number(pdpListPrice.innerText.replace(/(cents|\s|,)/g, '').replace(/and/g, '.').slice(1)).toFixed(2) : '';
        return {
            condition: parsedSku.querySelector('.pdp-info .pdp-sku > img') ? 'Refurb' : 'New',
            skuType: parsedSku.querySelectorAll('.pdp-img-carousel .pdp-img-magnify').length + parsedSku.querySelectorAll('#prodinfo .shortDesc .nomobile').length > 0 ? 'NO' : 'YES',
            stock: parsedSku.querySelectorAll('.pdp-info .outofStock').length ? 'Out of stock' : 'In stock',
            sku: parsedSku.querySelectorAll('.pdp .breadcrumb li')[parsedSku.querySelectorAll('.pdp .breadcrumb li').length - 1].innerText,
            category: parsedSku.querySelectorAll('.pdp .breadcrumb li')[parsedSku.querySelectorAll('.pdp .breadcrumb li').length - 2].innerText,
            edp: edp,
            rating: parsedSku.querySelector('.pdp-info .with-review .score') ? parsedSku.querySelector('.pdp-info .with-review .score').innerText : 'No Reviews',
            shipping: parsedSku.querySelector('.pdp-info').innerText.match(/Free Shipping Today!/) ? 'Free Shipping' : 'Not Free',
            priceInfo: finalPrice,
            LPInfo: listPrice
        }
    } catch(err){
        console.log(err)
    }
}


const formButton = document.querySelector('.qa-form form button');
const qaForm = document.querySelector('.qa-form form');
const campaignID = document.querySelector('.qa-form input#camID');

qaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.qa-results').innerHTML = '';
    //QAPCGaming(campaignID.value)
    if(campaignID.value == 3310){
        QAPCGaming(campaignID.value)
    } else {
        QAPage(campaignID.value);
    }
})


const getSku = (edp, sku, cat) => {
    const clipBoard = document.querySelector('.clipboard');
    clipBoard.insertAdjacentHTML('afterbegin', `<a href="https://www.tigerdirect.com/applications/searchtools/item-Details.asp?EdpNo=${edp}">${cat} - ${sku}</a>`)
    // if(window.clipboardData) {
    //     window.clipboardData.clearData();
    //     window.clipboardData.setData("Text", document.getElementById('txToCopy').value);
    // } 
}
//https://stark-brushlands-36367.herokuapp.com