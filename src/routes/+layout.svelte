<head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
</head>

<div class="centered">
    <h1>Bypass Paywall</h1>
    <slot/>
</div>


<style>
.centered {
    max-width: 50em;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

:global(body) {
    font-family: 'Roboto', sans-serif;
    margin: 0;
}


:global(input) {
	margin: 0.5em;
	padding: 0.5em;
	border: 1px solid #ccc;
	border-radius: 0.25em;
}

:global(button) {
	margin: 0.5em;
	padding: 0.5em;
	border: 1px solid #ccc;
	border-radius: 0.25em;
    background-color: #f3f3f3;

}

:global(button:hover) {
    cursor: pointer;
    background-color: #e0e0e0;
}

:global(h1) {
    margin-top: 2em;

    font-size: 2.5em;
    font-weight: 200;
}
</style>