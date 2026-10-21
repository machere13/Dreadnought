import { mockFigma } from './figmaMock.mjs';

export function canvasMock(opacityScale = 1) {
  const mock = mockFigma(opacityScale);
  const { api, page, styles } = mock;
  const nodes = new Map([[page.id, page]]);
  let next = 0;
  function descendants(node) {
    return node.children.flatMap((child) => [child, ...descendants(child)]);
  }
  function attach(parent, child) {
    if (child.parent) child.parent.children = child.parent.children.filter((n) => n !== child);
    parent.children.push(child);
    child.parent = parent;
  }
  page.appendChild = (child) => attach(page, child);
  page.findAllWithCriteria = ({ types }) => descendants(page).filter((n) => types.includes(n.type));
  function create(type) {
    const n = {
      id: 'canvas-' + ++next,
      type,
      name: '',
      children: [],
      fills: [],
      strokes: [],
      boundVariables: {},
      _width: 100,
      _height: 100,
      x: 0,
      y: 0,
      opacity: 1,
      visible: true,
      removed: false,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      itemSpacing: 0,
      fontName: { family: 'Roboto Flex', style: 'Regular' },
      fontSize: 16,
      characters: '',
      componentPropertyReferences: {},
      _definitions: {},
      componentProperties: {},
      appendChild(child) {
        attach(this, child);
      },
      findAllWithCriteria({ types }) {
        return descendants(this).filter((n) => types.includes(n.type));
      },
      findOne(predicate) {
        return descendants(this).find(predicate) || null;
      },
      resize(width, height) {
        if (!(width > 0 && height > 0)) throw new Error('Invalid dimensions');
        this._width = width;
        this._height = height;
        this.primaryAxisSizingMode = this.counterAxisSizingMode = 'FIXED';
      },
      resizeWithoutConstraints(width, height) {
        this.resize(width, height);
      },
      remove() {
        for (const child of [...this.children]) child.remove();
        if (this.parent)
          this.parent.children = this.parent.children.filter((child) => child !== this);
        this.removed = true;
        nodes.delete(this.id);
      },
      setBoundVariable(field, variable) {
        this.boundVariables[field] = { id: variable.id };
        const value = variable.resolveForConsumer(this).value;
        if (field === 'width' || field === 'height') this['_' + field] = value;
        else this[field] = field === 'opacity' ? value / opacityScale : value;
      },
      async setTextStyleIdAsync(id) {
        const style = styles.find((s) => s.id === id);
        if (!style) throw new Error('Missing text style');
        Object.assign(this, {
          textStyleId: id,
          fontName: style.fontName,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
        });
      },
      getStyledTextSegments() {
        return [{ fontName: this.fontName }];
      },
      addComponentProperty(name, type, defaultValue) {
        const key = name + '#' + this.id;
        this.componentPropertyDefinitions[key] = { type, defaultValue };
        return key;
      },
      setProperties(values) {
        Object.assign(this.componentProperties, values);
      },
      async getMainComponentAsync() {
        return this.main;
      },
      createInstance() {
        const instance = clone(this, 'INSTANCE');
        instance.main = this;
        return instance;
      },
      rescale(scale) {
        this._width = this.width * scale;
        this._height = this.height * scale;
        this.primaryAxisSizingMode = this.counterAxisSizingMode = 'FIXED';
      },
    };
    Object.defineProperty(n, 'componentPropertyDefinitions', {
      get() {
        if (this.type === 'COMPONENT' && this.parent?.type === 'COMPONENT_SET')
          throw new Error('Cannot read properties from a variant');
        return this._definitions;
      },
    });
    for (const dimension of ['width', 'height'])
      Object.defineProperty(n, dimension, {
        get() {
          if (this.type === 'TEXT')
            return dimension === 'width'
              ? Math.max(1, this.characters.length * this.fontSize * 0.55)
              : this.fontSize * 1.5;
          const horizontal = this.layoutMode === 'HORIZONTAL';
          const isPrimary = horizontal === (dimension === 'width');
          const hug =
            this.layoutMode &&
            (isPrimary ? this.primaryAxisSizingMode : this.counterAxisSizingMode) === 'AUTO';
          if (!hug) return this['_' + dimension];
          const flow = this.children.filter((c) => c.visible && c.layoutPositioning !== 'ABSOLUTE');
          const content = isPrimary
            ? flow.reduce((sum, child) => sum + child[dimension], 0) +
              Math.max(0, flow.length - 1) * this.itemSpacing
            : Math.max(0, ...flow.map((child) => child[dimension]));
          const padding =
            dimension === 'width'
              ? this.paddingLeft + this.paddingRight
              : this.paddingTop + this.paddingBottom;
          return Math.max(
            1,
            this[dimension === 'width' ? 'minWidth' : 'minHeight'] || 0,
            content + padding,
          );
        },
        set(value) {
          this['_' + dimension] = value;
        },
      });
    nodes.set(n.id, n);
    return n;
  }
  function clone(source, type = source.type) {
    const n = create(type);
    for (const key of [
      'name',
      '_width',
      '_height',
      'layoutMode',
      'primaryAxisSizingMode',
      'counterAxisSizingMode',
      'characters',
      'fontSize',
      'fontName',
      'visible',
      'fills',
      'strokes',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
      'itemSpacing',
      'minHeight',
      'opacity',
    ])
      if (source[key] !== undefined) n[key] = source[key];
    for (const child of source.children) n.appendChild(clone(child));
    return n;
  }
  api.createFrame = () => create('FRAME');
  api.createComponent = () => create('COMPONENT');
  api.createText = () => create('TEXT');
  api.createRectangle = () => create('RECTANGLE');
  api.createEllipse = () => create('ELLIPSE');
  api.createNodeFromSvg = (svg) => {
    const root = create('FRAME');
    for (const match of svg.matchAll(/<path\b/g)) root.appendChild(create('VECTOR'));
    return root;
  };
  api.getNodeByIdAsync = async (id) => nodes.get(id) || null;
  api.combineAsVariants = (variants, parent) => {
    const set = create('COMPONENT_SET');
    parent.appendChild(set);
    for (const variant of variants) set.appendChild(variant);
    return set;
  };
  return { ...mock, nodes };
}
