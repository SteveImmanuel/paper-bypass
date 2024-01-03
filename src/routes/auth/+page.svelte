<script>
	export let form;
</script>

{#if form?.message}
	<p class="error">{form.message}</p>
{/if}

<form method="POST">
	<div class='form-container'>
		<input name="username" autocomplete="off" required placeholder="username" />
		<input
			name="password"
			type="password"
			autocomplete="off"
			required
			placeholder="password"
		/>
		<button type="submit">Login</button>
	</div>
</form>

<style>
.form-container {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.error {
	color: red;
}
</style>