<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/lang';
</script>

<div class="flex w-full items-center justify-center">
	<div class="bg-white">
		<div class="flex flex-col items-center">
			<h1 class="text-3xl font-bold text-blue-600 lg:text-6xl">
				{page.status}
			</h1>

			<h6 class="mb-2 text-center text-2xl font-bold text-gray-800 md:text-3xl">
				<span class="text-red-500">Oops!</span>
				{page.error?.message}
			</h6>

			<a href="/" class="btn btn-primary rounded-full"
				><i class="fa-solid fa-home mr-2"></i>
				{$t.home}</a
			>
		</div>
	</div>
</div>
