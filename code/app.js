//# ----------------------------------------
//# Access shortcuts
//# ----------------------------------------
const body = document.body
Object.defineProperty(document, 'current', {
	get: function() {return this.querySelector('page.current').id}})
Object.defineProperty(document, 'page', {
	get: function() {return document.querySelector(`.page.current`)}})
Object.defineProperty(document, 'history', {
	get: function() {return document.querySelector(`#history`)}})
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
window.addEventListener('load', () => GoToPage('home'))
function gena(element, level=1) {
	let a = 'a'
	if (level == 1)
		a += `[section-link="${element.closest('section').previousElementSibling.getAttribute('section-id')}"]`
	else if (level == 2)
		a += `[page-link="${element.closest('.page').id}:${element.closest('section').previousElementSibling.getAttribute('section-id')}"]`
	else if (level == 3)
		a += `[page-link="${element.closest('.page').id}:${element.closest('section').previousElementSibling.getAttribute('section-id')}:${Array.from(element.parentElement.querySelectorAll('p, li')).indexOf(element)+1}"]`
	return a
}
function gena1(element) {return gena(element, 1)}
function gena2(element) {return gena(element, 2)}
function gena3(element) {return gena(element, 3)}
function sidenav() {
	const tabs = '\t\t\t\t\t'
	const pg = document.body.getAttribute('current')
	let r = '\n'+tabs
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
function pg2md() {
	const children = Array.from(document.page.content.children)
	let res = ''
	while (children.length) {
		const c = children.shift()
		switch (c.tagName) {
			case 'HEADER':
				res += c.querySelector('h1').textContent.replaceAll('\t','').trim().replace('\n', ' ')
					+ '\n'
					+ c.querySelector('h2').textContent.replaceAll('\t','').trim().replace('\n', ' ')
					+ '\n\n'
				break
			case 'H1':
				res += '# ' + c.textContent
				break
			case 'H2':
				res += '## ' + c.textContent
				break
			case 'H3':
				res += '### ' + c.textContent
				break
			case 'SECTION':
				res += c.textContent.replaceAll('\t', '')+'\n'
		}
	}
	return res
}

//# ----------------------------------------
//# Run on load
//# ----------------------------------------
//? Go to page and section on the link
const qparams = new URLSearchParams(window.location.search)
if (qparams.get('goto')){
	document.querySelector('.current')?.classList.remove('current')
	const [pg, sc, ps, pe] = [...qparams.get('goto').split(':')]
	setTimeout(() => GoToPage(pg, sc?.replaceAll('ý', '&') || null, ps || null, pe || null), 200)
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
//? Make page-links tabbable
document.querySelectorAll('a[page-link], a[section-link]').forEach(l => l.setAttribute('tabindex', '0'))
//? Make sidebar collapsible
let sidebar = true
const tg = document.createElement('button')
{
	tg.classList.add('toggle')
	tg.innerHTML = '<span>◀</span>'
	document.body.querySelector('main').prepend(tg)
	tg.addEventListener('click', function() {
		tg.classList.toggle('off')
		sidebar = !sidebar
		document.querySelectorAll('.sidebar').forEach(
			bar => bar.classList.toggle('collapsed')
		)
	})
}

// document.querySelectorAll('.sidebar').forEach(bar => {
// 	bar.prepend(tg)
// })

//# ----------------------------------------
//# Event listeners
//# ----------------------------------------
//? Section pointer updates
for (const page of document.querySelectorAll('main > .page'))
	page.content?.addEventListener('scroll', () => {
		throttle(Page_RefreshSectionPointer, 64)()
		page.content?.addEventListener('mouseup', Page_RefreshSectionPointer, {once:true})
	})
for (const pl of document.querySelectorAll('[page-link]'))
	pl.addEventListener('click', function() {
		const [pg, sc, pr] = [...this.getAttribute('page-link').split(':')]
		if (this.tagName != 'BUTTON')
			AddToHistory()
		GoToPage(pg, sc || null, pr || null)
		document.activeElement.blur()
	})
for (const nb of document.querySelectorAll('button[page-link]'))
	nb.addEventListener('click', () => document.history.innerHTML = '')
for (const sl of document.querySelectorAll('[section-link]'))
	sl.addEventListener('click', function() {
		if (this.tagName != 'BUTTON')
			AddToHistory()
		GoToSection(this.getAttribute('section-link'))
		document.activeElement.blur()
	})

//# ----------------------------------------
//# Section tracking
//# ----------------------------------------
function Page_GetCurrentLink() {
	const height = document.page.content.offsetHeight
	let ret
	for (const child of document.page.content.children) {
		const rect = child.getBoundingClientRect()
		if (rect.bottom >= height * .4) {
			Array.from(child.children).forEach((par, i) => {
				const rect = par.getBoundingClientRect()
				if (rect.bottom >= height *.4) {
					ret = `${body.getAttribute('current')}:${Page_GetCurrentSectionHeader()}:${i}`
					return
				}
			})
			break
		}
	}
	return ret
}
function Page_GetCurrentSection() {
	const height = document.page.content.offsetHeight
	for (const child of document.page.content.children) {
		const rect = child.getBoundingClientRect()
		if (rect.bottom >= height * .4)
			return child
	}
}
function Page_GetCurrentSectionHeader() {
	let section = Page_GetCurrentSection()
	if (section.tagName == 'HEADER')
		return document.page.content.querySelector('[section-id]')?.getAttribute('section-id')
	for (;!section.getAttribute('section-id'); section = section.previousElementSibling)
		null
	return section.getAttribute('section-id')
}
function Page_RefreshSectionPointer() {
	if (!document.page?.sidebar) return
	if (!document.page?.content) return
	const headerID = Page_GetCurrentSectionHeader()
	if (!headerID) return
	if (document.page.sidebar?.querySelector('.current') == document.page.sidebar.querySelector(`[section-link="${headerID}"]`)) return
	document.page.sidebar?.querySelector('.current')?.classList.remove('current')
	document.page.sidebar?.querySelector(`[section-link="${headerID}"]`).classList.add('current')
	document.page.sidebar?.querySelector(`[section-link="${headerID}"]`).scrollIntoView({ behavior:'smooth' })
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
	// debugger
	if (!document.querySelector('.toggle')) return
	if (next.sidebar)
		document.querySelector('.toggle').style.display = ''
	else
		document.querySelector('.toggle').style.display = 'none'
}
function GoToSection(id, ps=null, pe=null) {
	ps !== null? ps-- : null
	pe !== null? pe-- : null
	const dest = ps !== null? Array.from(document.page.querySelector(`[section-id="${id}"] + section`).querySelectorAll('p, li')).filter((_, i) => i >= ps && i <= (pe || ps))
	: [document.page.querySelector(`[section-id="${id}"] + section`)]
	if (!dest) return console.warn(`Destination not valid`)
	

	document.page.content.scrollTo({
		top: (dest[0].getBoundingClientRect().top + document.page.content.scrollTop - document.page.clientHeight * 0.3),
		behavior: 'smooth'
	})
	for (const e of dest) Blink(e)
}
function Blink(element) {
	element.classList.add('blink')
	setTimeout(() => element.classList.remove('blink'), 2000)
}
function AddToHistory() {
	const a = document.createElement('a')
	const sectionID = Page_GetCurrentSectionHeader()
	a.removeAttribute('href')
	a.setAttribute('tabindex', '0')
	a.setAttribute('page-link', Page_GetCurrentLink())
	a.innerHTML = `<b>${document.page.content.querySelector('header h1').textContent.trim().replaceAll('\t','').replace('\n',' ')}</b>${sectionID? `<span>${document.page.content.querySelector(`[section-id="${sectionID}"]`).textContent}</span>` : ''}`
	a.addEventListener('click', function() {
		const [pg, sc] = [...this.getAttribute('page-link').split(':')]
		GoToPage(pg, sc)

		const here = this.parentElement.querySelector('[disabled]')
		const index = Array.from(this.parentElement.children).indexOf(this)
		Array.from(this.parentElement.children).forEach((e, i) => {
			if (i > index && e != here) e.remove()
		})
		if (this.parentElement.childElementCount == 2)
			this.parentElement.innerHTML = ''
		else
			this.remove()
	})
	if (!document.history.innerHTML.length) {
		const here = document.createElement('span')
		here.textContent = 'Here'
		here.setAttribute('disabled', '')
		document.history.prepend(here)
	}
	document.history.insertBefore(a, document.history.lastElementChild)
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