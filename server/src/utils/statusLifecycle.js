const ALLOWED_NEXT = {
  Pending: ['In Transit'],
  'In Transit': ['Customs', 'Delivered'],
  Customs: ['Delivered'],
  Delivered: [],
};

const LIFECYCLE_ORDER= 'Pending -> In Transit -> Customs -> Delivered'

const isValidTransition = (from,to) => 
  from ===to || (ALLOWED_NEXT[from] ||
    []).includes(to);
  
const explainRejection = (from,to)=>{


  if(from==='Delivered'){
    return (
      'Cannot change status from Delivered to ' + to + '. The shipment has already been delivered'
);
}
 const order= Object.keys(ALLOWED_NEXT);
 if(order.indexOf(to)<order.indexOf(from)){
  return (
    'Cannot change status backward from' + from+ 'as it is against the order  ' + LIFECYCLE_ORDER + ' .'
  );
 }
  return(
    'Cannot change status from' + from + 'directly to' + to + '.Allowed next:' +ALLWOED_NEXT[from].join(' or ') + '.'
  );
};

const sortChronologically = (entries) => 
  entries
      .map((entry, index) => ({entry, index}))
      .sort((a,b) =>{
        const diff=new Date(a.entry.timestamp)-new Date(b.entry.timestamp);
      return diff !== 0 ? diff: a.index-b.index;
})
  .map(({entry})=>entry);

const checkNeighbours = (sorted, target) => {
  const i = sorted.indexOf(target);
  const prev = sorted[i-1];
  const next = sorted[i+1];

  if (prev && !isValidTransition(prev.status, target.status)){
    return explainRejection(prev.status, target.status);
  }
  if (next && !isValidTransition(target.status, next.status)){
    const allowed= ALLOWED_NEXT[target.status];
    return (
      'cannot record' + target.status + ' here: the next entry is' + next.status + 'Allowed after' +':'+ (allowed.join(' or ')|| 'none') + '.'
    );
  }
  return null;
  };

const validateNewEntry = (history, newEntry) => {
  const sorted = sortChronologically([...history, newEntry]);
    return checkNeighbours(sorted, newEntry);
};

const validateEditedEntry = (history, entryId, changes) => {
  if( changes.status===undefined && changes.timestamp === undefined) return null;
  const candidates = history.map((e)=>
    String(e._id)=== String(entryId)
  ?{ _id: e._id, status: changes.status ?? e.status, timestamp:
    changes.timestamp ?? e.timestamp
  }: {_id: e._id, status: e.status, timestamp:
     e.timestamp }
);
 const target = candidates.find((e) => 
String(e._id) === String(entryId));
 return 
checkNeighbours(sortChronologically(candidates), target);
};

const validateDeletion = (history, entryId) => {
  const sorted = 
  sortChronologically(history.map((e)=>
  ({ _id: e._id, status: e.status, timestamp: e.timestamp})));
  const i = sorted.findIndex((e)=>
  String(e._id)===String(entryId));
  const prev = sorted[i-1];
  const next = sorted[i+1];
  if (prev && next && ! isValidTransition(prev.status, next.status))
  {
    return (
      'Cannot delete this entry'
    );
  }
  return null;
}


const latestStatus = (history, fallback) => {
  const sorted = 
  sortChronologically(history);
  return sorted.length ? sorted[sorted.length-1].status:fallback;
};

module.exports={
  ALLOWED_NEXT,
  isValidTransition,
  explainRejection,
  sortChronologically,
  validateNewEntry,
  validateEditedEntry,
  validateDeletion,
  latestStatus,
};
