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
		get: function() {return this.querySelector('.content')}})
}
const current = body.current
const page = body.page

//# ----------------------------------------
//# Event Listeners
//# ----------------------------------------
//? Section pointer updates
for (const page of document.querySelectorAll('main > .page'))
	page.content.addEventListener('scroll', Page_RefreshSectionPointer)

//# ----------------------------------------
//# Section tracking
//# ----------------------------------------
function Page_GetCurrentSection() {
	const height = page.content.offsetHeight
	for (const child of page.content.children) {
		const rect = child.getBoundingClientRect()
		if (rect.bottom >= height * .4)
			return child
	}
}
function Page_GetCurrentSectionHeader() {
	let section = Page_GetCurrentSection()
	for (;!section.tagName.match(/^h\d/i); section = section.previousElementSibling)
		null
	return section.textContent
}
function Page_RefreshSectionPointer() {
	console.log(1)
}