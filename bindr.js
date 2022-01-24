class Bindr{
    constructor(data= {}){
        this.templateMap = []
        this.inputTypes = [
            {type: 'text', field: 'value'}, 
            {type: 'number', field: 'value'}, 
            {type: 'checkbox', field: 'checked'},
            {type: 'radio', field: 'checked'}    
        ]
        let elements = document.querySelectorAll('[bind]')
        let proxy = new Proxy(data, {
            set: (target, property, value, receiver) => {               
                target[property] = value
                this.valueChanged(target, property, value)
                window.dispatchEvent(new CustomEvent(`B-${property}`, {detail: {property, value}}))
                return true
            }
        })
        elements.forEach(element => {
            this.templateMap.push([element, element.innerHTML])
                proxy[element.getAttribute('bind')] = data[element.getAttribute('bind')] || ''
                if(element.tagName === 'INPUT'){
                    element.addEventListener('input', (e) => {
                        proxy[e.target.getAttribute('bind')] = e.target.value
                    })
                }
        })

        return proxy
    }
    valueChanged(target, property, value){
        let elements = document.querySelectorAll('[bind]')
        elements.forEach(element => {
            if(element.tagName === 'INPUT'){
                if(element.getAttribute('bind') == property){
                    let type = this.inputTypes.find(type => type.type === element.type) || this.inputTypes[0]
                    element[type.field] = value
                }
            }
            let templateStr = this.templateMap.find(template => template[0] === element)
            if(templateStr){
                let template = templateStr[1].replace(/\{(.*?)\}/g, (match, p1) => {
                    return target[p1]
                })
                if(template != element.innerHTML){
                    element.innerHTML = template
                }
            }
            
        })
    }  
}
window.on = window.addEventListener
window.addEventListener('load', () => {
    window.B = new Bindr()
    window.dispatchEvent(new Event('Bindr'))
})