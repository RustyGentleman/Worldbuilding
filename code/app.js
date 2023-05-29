//# ----------------------------------------
//# Access shortcuts
//# ----------------------------------------
const body = document.body
Object.defineProperty(document.body, 'current', {
	get: function() {return this.querySelector('page.current').id}})
Object.defineProperty(document.body, 'page', {
	get: function() {return document.querySelector(`.page.current`)}})
for (const page of document.querySelectorAll('main > .page')) {
	Object.defineProperty(page, 'content', {
		get: function() {return this.querySelector('.content')}})
	Object.defineProperty(page, 'sidebar', {
		get: function() {return this.querySelector('.sidebar')}})
}

//# ----------------------------------------
//# In development
//# ----------------------------------------
const DEV = window.location.origin.match(/127.0.0.1/)
if (DEV) GoToPage('ras')
function gena(element, level=1) {
	let a = 'a'
	if (level == 1)
		a += `[section-link="${element.closest('h1, h2, h3').getAttribute('section-id')}"]`
	else if (level == 2)
		a += `[page-link="${element.closest('.page').id}"][section="${element.closest('h1, h2, h3').getAttribute('section-id')}"]`
	return a
}
function gena1(element) {return gena(element, 1)}
function gena2(element) {return gena(element, 2)}
function sidenav() {
	const tabs = '\t\t\t\t'
	const pg = document.body.getAttribute('current')
	let r = '<span class="header">Navigation:</span>\n'
	document.querySelector('.page#'+pg).querySelectorAll('.content>h1, .content>h2, .content>h3').forEach(h => {
		const l = h.getAttribute('section-id')
		const t = h.textContent
		let w
		switch (h.tagName) {
			case 'H1': w = 'b'; break
			case 'H2': w = 'span'; break
			case 'H3': w = 'i'; break
		}
		r += tabs+`<button class="header-pointer" section-link="${l}"><${w}>${t}</${w}></button>\n`
	})
	return r
}

//# ----------------------------------------
//# Run on load
//# ----------------------------------------
//? Go to page and section on the link
const qparams = new URLSearchParams(window.location.search)
if (qparams.get('page'))
	if (qparams.get('section'))
		GoToPage(qparams.get('page'), qparams.get('section')?.replaceAll('ý', '&'))
	else
		GoToPage(qparams.get('page'))

//? Generate link-generators for page sections
document.querySelectorAll('.page .content > h1, .page .content > h2, .page .content > h3').forEach(h => {
	h.innerHTML = `<span>${h.innerHTML}</span><button></button>`
	h.lastElementChild.addEventListener('click', () => {
		console.log(h.getAttribute('section-id').replaceAll('&', 'ý'))
		navigator.clipboard.writeText(
			window.location.origin
			+ window.location.pathname
			+ `?page=${h.closest('.page').id}&section=${h.getAttribute('section-id').replaceAll('&', 'ý')}`
		)
	})
})

//# ----------------------------------------
//# Event listeners
//# ----------------------------------------
//? Section pointer updates
for (const page of document.querySelectorAll('main > .page'))
	page.content?.addEventListener('scroll', Page_RefreshSectionPointer)
for (const pl of document.querySelectorAll('[page-link]'))
	pl.addEventListener('click', function() {
		GoToPage(
			this.getAttribute('page-link'),
			this.getAttribute('section')
		)
	})
for (const sl of document.querySelectorAll('[section-link]'))
	sl.addEventListener('click', function() {GoToSection(this.getAttribute('section-link'))})

//# ----------------------------------------
//# Section tracking
//# ----------------------------------------
function Page_GetCurrentSection() {
	const height = body.page.content.offsetHeight
	for (const child of body.page.content.children) {
		const rect = child.getBoundingClientRect()
		if (rect.bottom >= height * .4)
			return child
	}
}
function Page_GetCurrentSectionHeader() {
	let section = Page_GetCurrentSection()
	if (section.tagName == 'HEADER')
		return body.page.content.querySelector('[section-id]')?.getAttribute('section-id')
	for (;!section.getAttribute('section-id'); section = section.previousElementSibling)
		null
	return section.getAttribute('section-id')
}
function Page_RefreshSectionPointer() {
	if (!body.page?.content) return
	const headerID = Page_GetCurrentSectionHeader()
	if (!headerID) return
	body.page.sidebar.querySelector('.current')?.classList.remove('current')
	body.page.sidebar.querySelector(`[section-link="${headerID}"]`).classList.add('current')
}
Page_RefreshSectionPointer()

//# ----------------------------------------
//# Page transitions
//# ----------------------------------------
function GoToPage(id, section=null) {
	if (!document.querySelector(`.page#${id}`)) {
		console.warn(`No page with ID "${id}"`)
		return
	}
	body.setAttribute('current', id)

	const cur = document.querySelectorAll('.current')
	cur?.forEach(e => e.classList.remove('current'))
	cur?.forEach(e => e.classList.add('displaying'))
	setTimeout(() => cur?.forEach(e => e.classList.remove('displaying')), 1000)

	const next = document.querySelector('#'+id)
	next.classList.add('displaying')
	setTimeout(() => {
		next.classList.add('current')
		next.classList.remove('displaying')
	}, 10)
	setTimeout(Page_RefreshSectionPointer, 100)
	if (section)
	setTimeout(() => GoToSection(section), 100)
}
function GoToSection(id) {
	if (!body.page.querySelector(`[section-id="${id}"]`)) {
		console.warn(`No section with ID "${id}"`)
		return
	}
	body.page.content.scrollTo({
		top: (body.page.querySelector(`[section-id="${id}"]`).offsetTop - body.page.clientHeight * 0.3),
		behavior: 'smooth'
	})
}