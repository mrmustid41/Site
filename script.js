const products = {

money: [
{
name: "1M Money",
price: 1.99
},
{
name: "10M Money",
price: 9.99
}
],

items: [
{
name: "Rare Item",
price: 4.99
}
],

spawners: [
{
name: "Skeleton Spawner",
price: 7.99
}
]

};

let cart = [];

function loadCategory(category){

const productDiv =
document.getElementById("products");

productDiv.innerHTML = "";

products[category].forEach(product => {

productDiv.innerHTML += `

<div class="card">

<h3>${product.name}</h3>

<p>
€${product.price}
</p>

<button
onclick="addToCart(
'${product.name}',
${product.price}
)">
Add To Cart
</button>

</div>

`;

});

}

function addToCart(name, price){

cart.push({
name,
price
});

updateCart();

}

function updateCart(){

document.getElementById(
"cartCount"
).textContent = cart.length;

document.getElementById(
"cartItems"
).innerHTML = cart.map(
item => `<p>${item.name} - €${item.price}</p>`
).join("");

const total = cart.reduce(
(sum,item) => sum + item.price,
0
);

document.getElementById(
"total"
).textContent =
total.toFixed(2);

}

function toggleCart(){

document.getElementById(
"cart"
).classList.toggle(
"open"
);

}

loadCategory("money");