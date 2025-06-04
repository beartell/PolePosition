const [PreLoad, OnLoad] = require('../Pages/domain_select/domain_select_filter');

describe('domain_select_filter OnLoad', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="domainAdd"></button>
      <button id="rmvButton"></button>
      <div id="textContainer">
        <input type="text" id="domainInput0" class="w-100 mb-1" />
      </div>`;
  });

  test('initializes inputs based on content state', () => {
    const state = { pageContentState: { DomainInputs: ['first', 'second'] } };
    OnLoad(state);
    const container = document.getElementById('textContainer');
    expect(container.children.length).toBe(2);
    expect(container.children[0].value).toBe('first');
    expect(container.children[1].value).toBe('second');
  });

  test('remove button removes last input', () => {
    const state = { pageContentState: { DomainInputs: ['one', 'two'] } };
    OnLoad(state);
    document.getElementById('rmvButton').click();
    const container = document.getElementById('textContainer');
    expect(state.pageContentState.DomainInputs).toEqual(['one']);
    expect(container.children.length).toBe(1);
  });
});
