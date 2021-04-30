const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const COVID = $rdf.Namespace('urn:example:covid#');
const SCHEMA = $rdf.Namespace('http://schema.org');

// Log the user in and out on click
const popupUri = 'popup.html';
$('#login  button').click(() => solid.auth.popupLogin({ popupUri }));
$('#logout button').click(() => solid.auth.logout());

// Update components to match the user's login status
solid.auth.trackSession(session => {
  const loggedIn = !!session;
  $('#login').toggle(!loggedIn);
  $('#logout').toggle(loggedIn);
  if (loggedIn) {
    $('#user').text(session.webId);
    // Use the user's WebID as default profile
    if (!$('#profile').val())
      $('#profile').val(session.webId);
  }
});

$('#view').click(async function loadProfile() {
  // Set up a local data store and associated data fetcher
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  const person = $('#profile').val();
  console.log(person)
  await fetcher.load(person);

  // Display their details
  const contacts = store.any($rdf.sym(person), COVID('contacts'));
  const contact_list = contacts.value
  console.log(contact_list)
  // $('#fullName').text(fullName && fullName.value);

  await fetcher.load(contact_list);
  const firstcontact = store.any($rdf.sym(contact_list), SCHEMA('endDate'));
  console.log(firstcontact)
  console.log(firstcontact.value)
  $('#fullName').text(firstcontact && firstcontact.value);


  // Display their friends
  const friends = store.each($rdf.sym(person), FOAF('knows'));
  $('#friends').empty();
  friends.forEach(async (friend) => {
    await fetcher.load(friend);
    const fullName = store.any(friend, FOAF('name'));
    $('#friends').append(
      $('<li>').append(
        $('<a>').text(fullName && fullName.value || friend.value)
                .click(() => $('#profile').val(friend.value))
                .click(loadProfile)));
  });
});
