<script>
//OLI requires a AMD loader, the compiled OLI can run on this shim however
if (typeof window.define === 'undefined') {
	window.define = function (name, deps, module) {
		if (module && typeof module === 'function') { module.apply(this); }
	};
}
</script>
<script src="/webasp/js/oli-master.min.js?2"></script>
