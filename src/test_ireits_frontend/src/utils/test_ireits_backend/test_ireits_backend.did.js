export const idlFactory = ({ IDL }) => {
  const Document = IDL.Record({
    'id' : IDL.Nat64,
    'hash' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'doc_type' : IDL.Variant({
      'Inspection' : IDL.Null,
      'Contract' : IDL.Null,
      'Deed' : IDL.Null,
      'Title' : IDL.Null,
      'Other' : IDL.Null,
    }),
  });
  const Property = IDL.Record({
    'id' : IDL.Nat64,
    'nft_id' : IDL.Opt(IDL.Text),
    'status' : IDL.Variant({
      'Available' : IDL.Null,
      'Sold' : IDL.Null,
      'UnderContract' : IDL.Null,
    }),
    'documents' : IDL.Vec(Document),
    'owner' : IDL.Principal,
    'description' : IDL.Text,
    'price' : IDL.Float64,
    'location' : IDL.Text,
  });
  const Transaction = IDL.Record({
    'id' : IDL.Nat64,
    'status' : IDL.Variant({
      'Cancelled' : IDL.Null,
      'Completed' : IDL.Null,
      'Pending' : IDL.Null,
    }),
    'seller' : IDL.Principal,
    'property_id' : IDL.Nat64,
    'timestamp' : IDL.Nat64,
    'buyer' : IDL.Principal,
    'price' : IDL.Float64,
  });
  return IDL.Service({
    'add_document' : IDL.Func(
        [
          IDL.Nat64,
          IDL.Variant({
            'Inspection' : IDL.Null,
            'Contract' : IDL.Null,
            'Deed' : IDL.Null,
            'Title' : IDL.Null,
            'Other' : IDL.Null,
          }),
          IDL.Text,
        ],
        [IDL.Bool],
        [],
      ),
    'assign_agent' : IDL.Func([IDL.Nat64, IDL.Principal], [IDL.Bool], []),
    'complete_transaction' : IDL.Func([IDL.Nat64], [IDL.Bool], []),
    'get_all_properties' : IDL.Func([], [IDL.Vec(Property)], ['query']),
    'get_property' : IDL.Func([IDL.Nat64], [IDL.Opt(Property)], ['query']),
    'get_transaction' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(Transaction)],
        ['query'],
      ),
    'get_user_properties' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Property)],
        ['query'],
      ),
    'initiate_transaction' : IDL.Func([IDL.Nat64], [IDL.Nat64], []),
    'list_property' : IDL.Func(
        [IDL.Float64, IDL.Text, IDL.Text],
        [Property],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
