<script>
	import { t } from '$lib/lang';
</script>

<dialog
	class="modal"
	id="modal-howtocite"
	aria-labelledby="howtocite-title"
	aria-describedby="howtocite-content"
>
	<div class="modal-box w-full max-w-2xl">
		<div class="sticky top-0">
			<button
				class="btn btn-circle btn-sm absolute right-0 top-0"
				aria-label="Close"
				on:click={() => {
					let dialog = document.getElementById('modal-howtocite');
					if (dialog instanceof HTMLDialogElement) {
						dialog.close();
					}
				}}>✕</button
			>
		</div>
		<h3 class="mb-4 text-lg font-bold">
			{$t.titles.howtocite}
		</h3>
		<div>
			<p>
				<b>Manual:</b> <br /> Gonçalves, J., Marcos, B., Regos, A., Portela, P., Alves, C., Castro,
				P., Mota, D., Alonso, J., & Honrado, J. (2024).
				<em>SeverusPT - Data Products and Data Portal Manual</em>
				(v-0.5.0_20240209). Zenodo.
				<a
					href="https://doi.org/10.5281/zenodo.10640961"
					target="_blank"
					class="link-hover link text-blue-600"
					rel="noopener noreferrer">https://doi.org/10.5281/zenodo.10640961</a
				>
			</p>
			<br />
			<p>
				<b>Dataset (v02)</b>: <br /> Gonçalves, J. F., Marcos, B., & Honrado, J. (2024).
				<em>SeverusPT - A multi-source burn severity dataset for mainland Portugal</em>
				(Version v02) [Data set]. Zenodo.
				<a
					href="https://doi.org/10.5281/zenodo.10636820"
					target="_blank"
					class="link-hover link text-blue-600"
					rel="noopener noreferrer">https://doi.org/10.5281/zenodo.10636820</a
				>
			</p>
		</div>
	</div>
</dialog>
