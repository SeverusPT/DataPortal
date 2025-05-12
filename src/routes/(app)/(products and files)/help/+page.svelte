<script>
	import { t } from '$lib/lang';
	let url = 'https://severus.pt/en/severuspt_data_products_manual-last-version/';
	import { pageTitle } from '$lib/stores/title';

	pageTitle.set('titles.help');
</script>

<iframe title="{$t.titles.help}-PDF" src={url} style="width:100%; height:100vh;" frameborder="0"
></iframe>
