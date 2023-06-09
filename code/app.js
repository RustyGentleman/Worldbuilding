//# ----------------------------------------
//# Access shortcuts
//# ----------------------------------------
const body = document.body
const popover = document.querySelector('#popover')
Object.defineProperty(document, 'current', {get: function() {return this.querySelector('page.current').id}})
Object.defineProperty(document, 'page', {get: function() {return document.querySelector(`.page.current`)}})
Object.defineProperty(document, 'history', {get: function() {return document.querySelector(`#history`)}})
for (const page of document.querySelectorAll('main > .page')) {
	Object.defineProperty(page, 'content', {get: function() {return this.querySelector('.content')}})
	Object.defineProperty(page, 'sidebar', {get: function() {return this.querySelector('.sidebar')}})
}
{// - Popover
	Object.defineProperty(popover, 'title', {
		get: function() {return this.querySelector('.title-subtitle b')},
		set: function(content) {this.querySelector('.title-subtitle b').textContent = content}
	})
	Object.defineProperty(popover, 'subtitle', {
		get: function() {return this.querySelector('.title-subtitle i')},
		set: function(content) {this.querySelector('.title-subtitle i').textContent = content}
	})
	Object.defineProperty(popover, 'section', {
		get: function() {return this.querySelector('.section')},
		set: function(content) {this.querySelector('.section').innerHTML = content}
	})
	Object.defineProperty(popover, 'preview', {
		get: function() {return this.querySelector('.preview')},
		set: function(content) {this.querySelector('.preview').innerHTML = content}
	})
}

//# ----------------------------------------
//# In development
//# ----------------------------------------
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
function treeworld() {
	const tree = (function(){
		let headers = Array.from(document.querySelector('#world > div').children).filter(e => e.tagName == 'SPAN').map((h, i) => {
			return [`- ${h.textContent}`, Array.from(document.querySelector('#world > div').querySelectorAll(`.tiled:nth-of-type(${i+1}) > .tile`)).map(t => `\t- ${t.querySelector('h1').innerText.trim().replaceAll('\t','').replaceAll('\n', ' ')} - ${t.querySelector('h2').innerText.trim().replaceAll('\t','').replaceAll('\n', ' ')}`).join('\n')].join('\n')
		})
		return headers.join('\n')
	})()
	console.log(tree)
	return tree
}
function treecurrent() {
	const tree = Array.from(document.page.querySelectorAll('.content > h1, .content > h2, .content > h3'))
		.map(h => {
			let num = h.tagName.match(/\d+/)[0]
			let ret = ''
			while (num != 1) {
				ret += '\t'
				num--
			}
			return ret + '- ' + h.innerText.trim().replaceAll('\n', ' ')
		})
		.join('\n')
	console.log(tree)
	return tree
}
function pg2template() {
	return (function(){
		const pg = document.page.content
		let out = `
		title: '${trim(pg.querySelector('header h1'))}',
		subtitle: '${(pg.querySelector('header h2'))? trim((pg.querySelector('header h2'))) : ''}',
		sections: [${(function(){
				return Array.from(pg.children).filter(e => e.tagName != 'HEADER' && e.tagName != 'SECTION')
					.map(e => {
return `
			{
				h: ${e.tagName.match(/\d/)[0]},
				title: '${trim(e)}',
				id: '${e.getAttribute('section-id')}',
				elements: [${(function(){
					return Array.from(e.nextElementSibling.children)
						.map(p => {
return `
					{
						tag: '${p.tagName}',
						content: \`${p.innerHTML}\`,
					},`
						}).join('')
			})()}\n\t\t\t\t]
			},`
					}).join('')
			})()}\n\t\t]
`
	
		return out
		function trim(str) {
			return str.innerText.replaceAll('\t','').replaceAll('\n',' ')
		}
	})()
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
} else GoToPage('home')
//? Generate link-generators for page sections
document.querySelectorAll('.page .content > h1, .page .content > h2, .page .content > h3').forEach(h => {
	h.innerHTML = `<span>${h.innerHTML}</span><button aria-label="Copy a link to here"></button>`
	h.lastElementChild.addEventListener('click', () => {
		// console.log(h.getAttribute('section-id').replaceAll('&', 'ý'))/
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
//? Gather link data
document.querySelectorAll('a[page-link], a[section-link]').forEach(l => {
	if (l.getAttribute('page-link') == '' || l.getAttribute('section-link') == '')
		return
	const [pg, sc, ps, pe] = l.getAttribute('page-link')?.split(':') || [l.closest('.page').id, l.getAttribute('section-link'), undefined]
	// console.log(pg, sc, pr)
	if (!document.getElementById(pg)) return

	let title = [document.getElementById(pg).querySelector('.content header h1').textContent.trim().replaceAll('\t', '').replaceAll('\n', ' ')]
	let subtitle = document.getElementById(pg).querySelector('.content header h2')?.textContent.trim().replaceAll('\t', '').replaceAll('\n', ' ') || ''
	if (sc)
		title.push(document.getElementById(pg).querySelector(`[section-id="${sc}"]`)?.textContent.trim().replaceAll('\t', '').	replaceAll('\n', ' '))
	if (sc && ps && pe)
		title.push(`Paragraphs ${ps}-${pe}`)
	else if (sc && ps)
		title.push(`Paragraph ${ps}`)
	l.setAttribute('title', title.filter(e => !!e).join(' > '))

	let preview = ''
	if (sc && ps && pe)
		preview = Array.from(document.getElementById(pg).querySelector(`[section-id="${sc}"] + section`)?.querySelectorAll('p, li'))?.filter((_, i) => (i+1) >= ps && (i+1) <= pe).map(e => `<p>${e.textContent}</p>`).join('\n') || 'Error'
	else if (sc && ps)
		preview = `<p>${document.getElementById(pg).querySelector(`[section-id="${sc}"] + section`)?.querySelectorAll('p, li')[ps-1]?.textContent}</p>` || 'Error'
	else if (sc)
		preview = `<p>${document.getElementById(pg).querySelector(`[section-id="${sc}"] + section`)?.textContent}</p>` || 'Error'
	else
		preview = `<p>${document.getElementById(pg).querySelector(`.content > h1 + section`)?.textContent}</p>` || 'Error'
	if (preview.length >= 200)
		preview = preview.replaceAll('\t', '').replaceAll('\n', ' ').replace(/^(.{200}[^\s\.]*).*/, "$1...</p>")

	if (title[0])
		l.setAttribute('data-title', title[0])
	if (title[1] && ps && pe)
		l.setAttribute('data-section', `<span>${title[1]}</span><span>paras. ${ps}-${pe}</span>`)
	else if (title[1] && ps)
		l.setAttribute('data-section', `<span>${title[1]}</span><span>para. ${ps}</span>`)
	else if (title[1])
		l.setAttribute('data-section', title[1])
	else
		l.setAttribute('data-section', document.getElementById(pg).querySelector('.content > h1').textContent.trim().replaceAll('\t', '').replaceAll('\n', ' '))
	l.setAttribute('data-preview', preview)
	l.setAttribute('data-subtitle', subtitle)
})
//? Popover
{
	const INTERVAL = 500
	let to_show = []
	let to_hide = []
	let last
	function Show(instant=false) {
		const to = setTimeout(() => {
			popover.classList.add('active')
			to_show = to_show.filter(e => e != to)
		}, instant? 0 : INTERVAL)
		to_show.push(to)
	}
	function Hide(instant=false) {
		const to = setTimeout(() => {
			popover.classList.remove('active')
			to_hide = to_hide.filter(e => e != to)
		}, instant? 0 : INTERVAL)
		to_hide.push(to)
	}
	function AddToPopover(link) {
		[popover.title, popover.subtitle, popover.section, popover.preview] = [link.dataset.title, link.dataset.subtitle, link.dataset.section, link.dataset.preview]
	}

	document.querySelectorAll('a[page-link], a[section-link]').forEach(l => {
		l.addEventListener('mouseover', () => {
			// console.log('link hover', to_show.length, to_hide.length)
			to_hide.forEach(e => clearTimeout(e))
			to_hide = []
			Show(popover.classList.contains('active'))

			AddToPopover(l)
			const rect = l.getBoundingClientRect()
			popover.style.setProperty('--x', `${rect.left + rect.width}px`)
			popover.style.setProperty('--y', `${rect.top - popover.clientHeight}px`)

			l.addEventListener('mouseleave', () => {
				// console.log('link leave', to_show.length, to_hide.length)
				to_show.forEach(e => clearTimeout(e))
				to_show = []
				if (popover.classList.contains('active')) Hide()
			})
		})
	})
	popover.addEventListener('mouseover', () => {
		// console.log('popover hover', to_show.length, to_hide.length)
		to_hide.forEach(e => clearTimeout(e))
		to_hide = []
		Show(popover.classList.contains('active'))
		popover.addEventListener('mouseleave', () => {
			// console.log('popover leave', to_show.length, to_hide.length)
			to_show.forEach(e => clearTimeout(e))
			to_show = []
			if (popover.classList.contains('active')) Hide()
		})
	})
}

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
	if (pl.getAttribute('page-link'))
		pl.addEventListener('click', function() {
			const [pg, sc, ps, pe] = [...this.getAttribute('page-link').split(':')]
			// console.log(pg, sc, ps, pe)
			if (this.tagName != 'BUTTON')
				AddToHistory()
			GoToPage(pg, sc || null, ps || null, pe || null)
			document.activeElement.blur()
		})
for (const nb of document.querySelectorAll('button[page-link]'))
	nb.addEventListener('click', () => document.history.innerHTML = '')
for (const sl of document.querySelectorAll('[section-link]'))
	if (sl.getAttribute('section-link'))
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
		const [pg, sc, pr] = [...this.getAttribute('page-link').split(':')]
		GoToPage(pg, sc, pr)

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