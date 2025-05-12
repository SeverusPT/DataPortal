<!--
  Compoment to get SVG icon with parameters

<svg 
  stroke="currentColor" 
  fill="currentColor" 
  stroke-width="0" 
  viewBox="0 0 1024 1024" 
  height="1em" 
  width="1em" 
  xmlns="http://www.w3.org/2000/svg">
  <path d="M365.3 518.5l246 178c5.3 3.8 12.7 0 12.7-6.5v-46.9c0-10.2-4.9-19.9-13.2-25.9L465.4 512l145.4-105.2c8.3-6 13.2-15.6 13.2-25.9V334c0-6.5-7.4-10.3-12.7-6.5l-246 178a8.05 8.05 0 0 0 0 13z"></path><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path>
</svg>

-->

<script lang="ts">
	export let name: string;
	export let width = '1em';
	export let height = '1em';
	export let preserveAspect: boolean = true;
	export let strokeWidth = '0';

	let icons: {
		[name: string]: {
			box: number[];
			svg: string;
		};
	} = {
		unknown: {
			box: [24, 24],
			svg: `<g><path fill="none" d="M0 0h24v24H0z"></path><path fill-rule="nonzero" d="M11 15h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 0 1 1-1 1.5 1.5 0 1 0-1.471-1.794l-1.962-.393A3.501 3.501 0 1 1 13 13.355zM15 4H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992z"></path></g>`
		},
		MdZoomOutMap: {
			box: [24, 24],
			svg: `<path fill="none" d="M0 0h24v24H0z"></path><path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z"></path>`
		},
		RiContrastFill: {
			box: [24, 24],
			svg: `<path fill="none" d="M0 0h24v24H0z"></path><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2V4a8 8 0 1 0 0 16z"></path>`
		},
		BiCollapseVertical: {
			box: [24, 24],
			svg: `<path d="M12 7.59 7.05 2.64 5.64 4.05 12 10.41l6.36-6.36-1.41-1.41L12 7.59zM5.64 19.95l1.41 1.41L12 16.41l4.95 4.95 1.41-1.41L12 13.59l-6.36 6.36z"></path>`
		},
		BiExpandVertical: {
			box: [24, 24],
			svg: `<path d="m12 19.24-4.95-4.95-1.41 1.42L12 22.07l6.36-6.36-1.41-1.42L12 19.24zM5.64 8.29l1.41 1.42L12 4.76l4.95 4.95 1.41-1.42L12 1.93 5.64 8.29z"></path>`
		},
		MdSatellite: {
			box: [24, 24],
			svg: `<path fill="none" d="M0 0h24v24H0z"></path><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.99h3C8 6.65 6.66 8 5 8V4.99zM5 12v-2c2.76 0 5-2.25 5-5.01h2C12 8.86 8.87 12 5 12zm0 6l3.5-4.5 2.5 3.01L14.5 12l4.5 6H5z"></path>`
		}
	};

	let displayIcon = icons[name] || icons['unknown'];
	// To update the icon if name changes (width, height and $$prop.class are in the DOM but name is used in object)
	$: name, (displayIcon = icons[name] || icons['unknown']);
</script>

<svg
	stroke="currentColor"
	fill="currentColor"
	stroke-width={strokeWidth}
	class={$$props.class}
	{width}
	{height}
	viewBox={`0 0 ${displayIcon.box[0]} ${displayIcon.box[1]}`}
	preserveAspectRatio={preserveAspect ? 'xMidYMid meet' : 'none'}
	xmlns="http://www.w3.org/2000/svg"
	>{@html displayIcon.svg}
</svg>
