local site_hosts = {
  ["zongqiwan.com"] = true,
  ["www.zongqiwan.com"] = true,
  ["zongqi-wan.github.io"] = true,
}

function Link(link)
  local host = link.target:match("^https?://([^/?#]+)") or link.target:match("^//([^/?#]+)")
  if host and not site_hosts[host:lower()] then
    link.attributes.target = "_blank"
    link.attributes.rel = "noopener noreferrer"
  end
  return link
end
