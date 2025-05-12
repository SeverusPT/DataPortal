<script lang="ts">
	import IconSvg from '../Images/iconSVG.svelte';
	import { colorsSev, getColorMap } from '../../lib/map/Colors';
	import { t } from '$lib/lang';

	export let fileName;

	let expanded = true;

	// Funções auxiliares para a legenda
	const colormap = getColorMap(fileName);

	function formatNum(value: number) {
		// Se quiser especificamente "-1e+7" para -1e7, e "1e+7" para 1e7:
		if (value === -1e7) return '-1e+7';
		if (value === 1e7) return '1e+7';

		// Se quiser que 1 apareça como "1", 0 como "0" etc.
		// e não se importe se for "1895", "2.862e+3", etc.,
		// pode usar .toString() ou .toExponential().
		// Exemplo usando toString():
		return value.toString();
	}

	// Primeiro intervalo:  [-1E7, 0]
	const intervals = colormap.map((c, i) => {
		const isFirst = i === 0;
		// Se for a última faixa, feche com ']', senão feche com '['
		const closingBracket = isFirst ? ']' : '[';
		return `[${formatNum(c.valIn)}, ${formatNum(c.valEx)}${closingBracket}`;
	});

	const severityLabels = [
		$t.severity.null,
		$t.severity.veryLow,
		$t.severity.low,
		$t.severity.moderate,
		$t.severity.high,
		$t.severity.veryHigh
	];

	const items = intervals.map((range, i) => ({
		range,
		severity: severityLabels[i] || 'N/A',
		color: colorsSev[i] || '#000'
	}));
</script>

<div class="flex w-max flex-col rounded-sm bg-slate-200 p-1">
	<div class="flex justify-between">
		<span class="font-bold">{$t.severity.legend}</span>
		<button on:click={() => (expanded = !expanded)}>
			{#if expanded}
				<IconSvg name="BiCollapseVertical" height="16px" width="16px" class="pointer-events-none" />
			{:else}
				<IconSvg name="BiExpandVertical" height="16px" width="16px" class="pointer-events-none" />
			{/if}
		</button>
	</div>

	<div
		class="grid grid-cols-[20px_auto] items-center gap-1 border-t-2 border-slate-700"
		style="display:{expanded ? '' : 'none'}"
	>
		{#each items as { range, severity, color }, i}
			<div
				class={i === 0 ? 'mt-1' : ''}
				style="background-color: {color}; width: 20px; height: 20px;"
			></div>
			<div class="flex flex-col {i === 0 ? 'mt-1' : ''}">
				<span>{severity}</span>
				<span>{range}</span>
			</div>
		{/each}
	</div>
</div>
