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
else GoToPage('home')
function gena(element, level=1) {
	let a = 'a'
	if (level == 1)
		a += `[section-link="${element.closest('section').previousElementSibling.getAttribute('section-id')}"]`
	else if (level == 2)
		a += `[page-link="${element.closest('.page').id}:${element.closest('section').previousElementSibling.getAttribute('section-id')}"]`
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
if (qparams.get('goto')){
	document.querySelector('.current')?.classList.remove('current')
	const [pg, sc, ps, pe] = [...qparams.get('goto').split(':')]
	setTimeout(() => GoToPage(pg, sc.replaceAll('ý', '&') || null, ps || null, pe || null), 20)
}

//? Generate link-generators for page sections
document.querySelectorAll('.page .content > h1, .page .content > h2, .page .content > h3').forEach(h => {
	h.innerHTML = `<span>${h.innerHTML}</span><button></button>`
	h.lastElementChild.addEventListener('click', () => {
		console.log(h.getAttribute('section-id').replaceAll('&', 'ý'))
		navigator.clipboard.writeText(
			window.location.origin
			+ window.location.pathname
			+ `?goto=${h.closest('.page').id}:${h.getAttribute('section-id').replaceAll('&', 'ý')}`
		)
	})
})

//# ----------------------------------------
//# Event listeners
//# ----------------------------------------
//? Section pointer updates
for (const page of document.querySelectorAll('main > .page'))
	page.content?.addEventListener('scroll', throttle(Page_RefreshSectionPointer, 64))
for (const pl of document.querySelectorAll('[page-link]'))
	pl.addEventListener('click', function() {
		const [pg, sc, pr] = [...this.getAttribute('page-link').split(':')]
		GoToPage(pg, sc || null, pr || null)
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
function GoToPage(id, section=null, ps=null, pe=null) {
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
	setTimeout(() => GoToSection(section, ps, pe), 100)
}
function GoToSection(id, ps=null, pe=null) {
	ps !== null? ps-- : null
	pe !== null? pe-- : null
	debugger
	const dest = ps !== null? Array.from(body.page.querySelectorAll(`[section-id="${id}"] + section p`)).filter((_, i) => i >= ps && i <= (pe || ps))
	: [body.page.querySelector(`[section-id="${id}"] + section`)]
	if (!dest) return console.warn(`Destination not valid`)
	

	body.page.content.scrollTo({
		top: (dest[0].getBoundingClientRect().top + body.page.content.scrollTop - body.page.clientHeight * 0.3),
		behavior: 'smooth'
	})
	for (const e of dest) Blink(e)
}
function Blink(element) {
	element.classList.add('blink')
	setTimeout(() => element.classList.remove('blink'), 2000)
}

//# ----------------------------------------
//# Helper functions
//# ----------------------------------------
function throttle(cb, delay) {
	let wait = false;

	return (...args) => {
		if (wait) {
			return;
		}

		cb(...args);
		wait = true;
		setTimeout(() => {
			wait = false;
		}, delay);
	}
}