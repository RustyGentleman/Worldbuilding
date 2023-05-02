//# ----------------------------------------
//# Access shortcuts
//# ----------------------------------------
const body = document.body
Object.defineProperty(document.body, 'current', {
	get: function() {return this.getAttribute('current')}})
Object.defineProperty(document.body, 'page', {
	get: function() {return document.querySelector(`.page#${this.current}`)}})
for (const page of document.querySelectorAll('main > .page')) {
	Object.defineProperty(page, 'content', {
		get: function() {return this.querySelector('.content')}})
	Object.defineProperty(page, 'sidebar', {
		get: function() {return this.querySelector('.sidebar')}})
}

//# ----------------------------------------
//# In development
//# ----------------------------------------
const DEV = false
if (DEV) GoToPage('elvenempire')

//# ----------------------------------------
//# Run on load
//# ----------------------------------------
//? Go to page and section on the link
const qparams = new URLSearchParams(window.location.search)
if (qparams.get('page'))
	GoToPage(qparams.get('page'), qparams.get('section').replaceAll('ý', '&'))

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
function GoToPage(id, section) {
	if (!document.querySelector(`.page#${id}`)) {
		console.warn(`No page with ID "${id}"`)
		return
	}
	body.setAttribute('current', id)
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