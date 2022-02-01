<script>
	// Imports
	import Button from '@smui/button';
	import CircularProgress from '@smui/circular-progress'
	import DataTable, { Head, Body, Row, Cell, Pagination } from '@smui/data-table'
	import IconButton from '@smui/icon-button'
	import LayoutGrid, { Cell as GridCell } from '@smui/layout-grid'
	import Textfield from '@smui/textfield'

	// Bindings
	let currentPage = 0
	let listInput = null
	let loading = false
	let permutations = null
	let rowsPerPage = 10
	let now
	let then

	// Reactive Declarations
	$: listParsed = listInput ? listInput.split(',').map(n => Number(n)) : []
	$: start = currentPage * rowsPerPage
	$: numPerms = permutations ? permutations.length : 0
	$: end = Math.min(start + rowsPerPage, numPerms)
	$: slice = permutations ? permutations.slice(start, end) : []
	$: lastPage = Math.max(Math.ceil(numPerms / rowsPerPage) - 1, 0)
	$: invalid = listParsed.some(isNaN) || listParsed.length < 2
	$: if (currentPage > lastPage) {
		currentPage = lastPage;
	}

	// JS
	const worker = new Worker(new URL('./permutationsWorker.js', import.meta.url))
	worker.onmessage = e => {
		loading = false
		permutations = e.data
		now = new Date
		console.log(now - then)
	} 

	function computeN(length) {
		let rval = 1
		for (let i = 2; i <= length; i++)
			rval = rval * i
		return rval
	}
	function permute() {
		then = new Date
		permutations = null
		loading = true
		listParsed.sort()
		worker.postMessage({ arr: listParsed, n: computeN(listParsed.length) })
	}
	function permuteJS() {
		then = new Date
		permutations = null
		loading = true
		listParsed.sort()
		var length = listParsed.length,
			result = [listParsed.slice()],
			c = new Array(length).fill(0),
			i = 1, k, p;

		while (i < length) {
			if (c[i] < i) {
				k = i % 2 && c[i];
				p = listParsed[i];
				listParsed[i] = listParsed[k];
				listParsed[k] = p;
				++c[i];
				i = 1;
				result.push(listParsed.slice());
			} else {
				c[i] = 0;
				++i;
			}
		}
		loading = false
		permutations = result
		now = new Date
		console.log(now - then)
	}

</script>

<main>
	<h1>Permutations</h1>
	<LayoutGrid>
		<GridCell span={12}>
			<Textfield
				type="text"
				bind:value={listInput}
				label="List (e.g., 1,2,3)"
			>
			</Textfield>
		</GridCell>
		<GridCell span={12}>
			<Button on:click={permute} disabled='{invalid}'>Permute</Button>
		</GridCell>
		<GridCell span={12}>
			{#if loading}
			<CircularProgress style="height: 48px; width: 48px;" indeterminate />
			{/if}
			{#if permutations}
				<DataTable style="max-width: 400px">
					<Head>
						<Row>
						<Cell>Permutation</Cell>
						</Row>
					</Head>
					<Body>
						{#each slice as p}
							<Row>
								<Cell>{p}</Cell>
							</Row>
						{/each}
					</Body>
					<Pagination slot="paginate">
						<!-- <svelte:fragment slot="rowsPerPage">
						<Label>Rows Per Page</Label>
						<Select variant="outlined" bind:value={rowsPerPage} noLabel>
							<Option value={10}>10</Option>
							<Option value={25}>25</Option>
							<Option value={100}>100</Option>
						</Select>
						</svelte:fragment> -->
						<svelte:fragment slot="total">
						{start + 1}-{end} of {numPerms}
						</svelte:fragment>
					
						<IconButton
						class="material-icons"
						action="first-page"
						title="First page"
						on:click={() => (currentPage = 0)}
						disabled={currentPage === 0}>first_page</IconButton
						>
						<IconButton
						class="material-icons"
						action="prev-page"
						title="Prev page"
						on:click={() => currentPage--}
						disabled={currentPage === 0}>chevron_left</IconButton
						>
						<IconButton
						class="material-icons"
						action="next-page"
						title="Next page"
						on:click={() => currentPage++}
						disabled={currentPage === lastPage}>chevron_right</IconButton
						>
						<IconButton
						class="material-icons"
						action="last-page"
						title="Last page"
						on:click={() => (currentPage = lastPage)}
						disabled={currentPage === lastPage}>last_page</IconButton
						>
					</Pagination>
				</DataTable>
			{/if}
		</GridCell>
	</LayoutGrid>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
