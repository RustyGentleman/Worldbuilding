//# ----------------------------------------
//# Shortcuts
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
//# Event listeners
//# ----------------------------------------
//? Section pointer updates
for (const page of document.querySelectorAll('main > .page'))
	page.content?.addEventListener('scroll', Page_RefreshSectionPointer)
for (const pl of document.querySelectorAll('[page-link]'))
	pl.addEventListener('click', function() {GoToPage(this.getAttribute('page-link'))})
for (const pl of document.querySelectorAll('[section-link]'))
	pl.addEventListener('click', function() {
		const page = this.closest('.page')
		const sheader = page.querySelector(`[section-id="${this.getAttribute('section-link')}"]`)
		console.log(page, sheader)
		page.content.scrollTo({top: (sheader.offsetTop - page.clientHeight * 0.3), behavior: 'smooth' })
	})

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
		return body.page.content.querySelector('[section-id]').getAttribute('section-id')
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
function GoToPage(id) {
	body.setAttribute('current', id)
	setTimeout(Page_RefreshSectionPointer, 100)
}